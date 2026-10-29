// Offline-first outbox: stash/delete operations are queued locally and
// replayed against the backend when the network is available.
//
// Design rules (from product review):
// - Nothing is ever silently dropped. Operations that exhaust retries stay
//   stored with status 'failed' and remain visible, retryable and
//   cancellable by the user.
// - Retryable errors (network, 5xx, 408, 429) back off and retry;
//   permanent errors (auth, validation, other 4xx) fail immediately
//   instead of burning retries.
// - The queue is isolated per account: entries carry the account id they
//   were created under and only ever replay for that account. Logging in
//   as someone else never sees or replays another account's operations.
// - Replays guard against duplicate application (e.g. the save succeeded
//   server-side but the response was lost).
// Storage is pluggable so tests can run in-memory.

import type { Song } from '../types';

export type OutboxOperation =
    | { kind: 'save'; song: Song; playlistId?: string }
    | { kind: 'delete'; songId: string; spotifyTrackId?: string };

export type OutboxStatus = 'pending' | 'failed';
export type ErrorKind = 'retryable' | 'permanent' | 'auth';

export interface OutboxEntry {
    id: string;
    accountId: string;
    op: OutboxOperation;
    createdAt: number;
    attempts: number;
    status: OutboxStatus;
    lastError?: string;
    errorKind?: ErrorKind;
}

export interface OutboxStorage {
    getAll(): Promise<OutboxEntry[]>;
    put(entry: OutboxEntry): Promise<void>;
    remove(id: string): Promise<void>;
    clear(): Promise<void>;
}

// ---------- IndexedDB storage (browser) ----------

const DB_NAME = 'stash-outbox';
const STORE = 'ops';

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
            if (!req.result.objectStoreNames.contains(STORE)) {
                req.result.createObjectStore(STORE, { keyPath: 'id' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function tx<T>(db: IDBDatabase, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export function createIdbStorage(): OutboxStorage {
    return {
        async getAll() {
            const db = await openDb();
            const all = await tx(db, 'readonly', (s) => s.getAll() as IDBRequest<OutboxEntry[]>);
            db.close();
            return all.sort((a, b) => a.createdAt - b.createdAt);
        },
        async put(entry) {
            const db = await openDb();
            await tx(db, 'readwrite', (s) => s.put(entry));
            db.close();
        },
        async remove(id) {
            const db = await openDb();
            await tx(db, 'readwrite', (s) => s.delete(id));
            db.close();
        },
        async clear() {
            const db = await openDb();
            await tx(db, 'readwrite', (s) => s.clear());
            db.close();
        },
    };
}

// ---------- In-memory storage (tests / SSR fallback) ----------

export function createMemoryStorage(): OutboxStorage {
    const map = new Map<string, OutboxEntry>();
    return {
        async getAll() {
            return Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt);
        },
        async put(entry) {
            map.set(entry.id, entry);
        },
        async remove(id) {
            map.delete(id);
        },
        async clear() {
            map.clear();
        },
    };
}

// ---------- Error classification ----------

/** Attach an HTTP status to an error so the outbox can classify it. */
export function withStatus(err: unknown, status: number): Error {
    const e = err instanceof Error ? err : new Error(String(err));
    (e as Error & { status?: number }).status = status;
    return e;
}

/**
 * 401/403 mean the session expired or the token was revoked - the operation
 * is still wanted, it just needs a fresh login. It stays pending and
 * resumes after re-auth; it is never poisoned for this.
 * Other 4xx (except 408/429) means the request itself is wrong - validation
 * failed, resource gone. Retrying won't help; fail fast and let the user
 * decide. Network errors, 5xx, 408 and 429 are transient.
 */
export function classifyError(err: unknown): ErrorKind {
    const status = (err as { status?: number } | null)?.status;
    if (typeof status === 'number') {
        if (status === 401 || status === 403) return 'auth';
        if (status === 408 || status === 429 || status >= 500) return 'retryable';
        if (status >= 400 && status < 500) return 'permanent';
    }
    const code = (err as { code?: string } | null)?.code;
    if (code === 'PGRST301' || code === 'PGRST302') return 'auth'; // PostgREST JWT expired/invalid
    return 'retryable';
}

// ---------- Outbox ----------

const MAX_ATTEMPTS = 5;
const ANONYMOUS_ACCOUNT = 'anonymous';

function newId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
    return `op-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface ProcessOptions {
    /**
     * Return true when the operation is already reflected server-side
     * (e.g. the song is already in the playlist/history). The entry is then
     * discarded as applied instead of replayed into a duplicate.
     */
    isDuplicate?: (op: OutboxOperation) => Promise<boolean>;
}

export interface ProcessResult {
    synced: number;
    skippedDuplicates: number;
    failed: OutboxEntry[];
    /** True when processing stopped because the session needs re-auth.
     *  Affected entries stay pending and resume after login. */
    authNeeded: boolean;
}

export class Outbox {
    private accountId: string;

    constructor(private storage: OutboxStorage, accountId: string = ANONYMOUS_ACCOUNT) {
        this.accountId = accountId || ANONYMOUS_ACCOUNT;
    }

    /** Switch the active account (on login/logout). Only this account's
     *  entries are visible or replayed from now on. */
    setAccount(accountId: string): void {
        this.accountId = accountId || ANONYMOUS_ACCOUNT;
    }

    getAccount(): string {
        return this.accountId;
    }

    private forAccount(entries: OutboxEntry[]): OutboxEntry[] {
        return entries.filter((e) => e.accountId === this.accountId);
    }

    async enqueue(op: OutboxOperation): Promise<OutboxEntry> {
        const entry: OutboxEntry = {
            id: newId(),
            accountId: this.accountId,
            op,
            createdAt: Date.now(),
            attempts: 0,
            status: 'pending',
        };
        await this.storage.put(entry);
        return entry;
    }

    /** Pending (will-retry) operations for the active account. */
    async pending(): Promise<OutboxEntry[]> {
        return this.forAccount(await this.storage.getAll()).filter((e) => e.status === 'pending');
    }

    /** Operations that exhausted retries or hit a permanent error. They are
     *  kept until the user retries or cancels them - never auto-dropped. */
    async failed(): Promise<OutboxEntry[]> {
        return this.forAccount(await this.storage.getAll()).filter((e) => e.status === 'failed');
    }

    async pendingCount(): Promise<number> {
        return (await this.pending()).length;
    }

    /** Move a failed operation back to the pending queue for another try. */
    async retry(id: string): Promise<void> {
        const entry = (await this.storage.getAll()).find((e) => e.id === id && e.accountId === this.accountId);
        if (!entry) return;
        await this.storage.put({ ...entry, status: 'pending', attempts: 0, lastError: undefined, errorKind: undefined });
    }

    /** Permanently discard an operation the user no longer wants. This is
     *  the only path that removes an unsynced entry, and it is explicit. */
    async cancel(id: string): Promise<void> {
        const entry = (await this.storage.getAll()).find((e) => e.id === id && e.accountId === this.accountId);
        if (!entry) return;
        await this.storage.remove(id);
    }

    /**
     * Replay pending operations for the active account, in order. Success
     * removes the entry. Duplicates are discarded without re-applying.
     * Retryable failures stay pending (up to MAX_ATTEMPTS, then become
     * 'failed' but stay stored and visible). Permanent failures become
     * 'failed' immediately. Processing stops at the first failure so later
     * ops don't reorder ahead of a stuck one.
     */
    async process(apply: (op: OutboxOperation) => Promise<void>, options: ProcessOptions = {}): Promise<ProcessResult> {
        const entries = await this.pending();
        let synced = 0;
        let skippedDuplicates = 0;
        let authNeeded = false;
        const failed: OutboxEntry[] = [];
        for (const entry of entries) {
            try {
                if (options.isDuplicate && (await options.isDuplicate(entry.op))) {
                    await this.storage.remove(entry.id);
                    skippedDuplicates++;
                    continue;
                }
                await apply(entry.op);
                await this.storage.remove(entry.id);
                synced++;
            } catch (err) {
                const lastError = err instanceof Error ? err.message : String(err);
                const errorKind = classifyError(err);
                if (errorKind === 'auth') {
                    // Not a failure of the operation itself: the session is
                    // stale. Keep the entry pending without spending an
                    // attempt and stop; it resumes after re-auth.
                    authNeeded = true;
                    await this.storage.put({ ...entry, lastError, errorKind });
                    break;
                }
                const attempts = entry.attempts + 1;
                const exhausted = errorKind === 'permanent' || attempts >= MAX_ATTEMPTS;
                const next: OutboxEntry = exhausted
                    ? { ...entry, attempts, lastError, errorKind, status: 'failed' }
                    : { ...entry, attempts, lastError, errorKind, status: 'pending' };
                await this.storage.put(next);
                failed.push(next);
                break;
            }
        }
        return { synced, skippedDuplicates, failed, authNeeded };
    }
}

export function createOutbox(accountId?: string): Outbox {
    const storage = typeof indexedDB !== 'undefined' ? createIdbStorage() : createMemoryStorage();
    return new Outbox(storage, accountId);
}
