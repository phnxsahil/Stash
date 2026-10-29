import { describe, it, expect } from 'vitest';
import { Outbox, createMemoryStorage, classifyError, withStatus, type OutboxOperation } from './outbox';
import type { Song } from '../types';

const song: Song = { id: 's1', song: 'Song', artist: 'Artist', source: 'instagram', album_art_url: '' };

describe('Outbox', () => {
    it('enqueues and replays operations in order', async () => {
        const outbox = new Outbox(createMemoryStorage());
        await outbox.enqueue({ kind: 'save', song });
        await outbox.enqueue({ kind: 'delete', songId: 's1' });
        const applied: OutboxOperation[] = [];
        const result = await outbox.process(async (op) => { applied.push(op); });
        expect(result.synced).toBe(2);
        expect(applied.map((a) => a.kind)).toEqual(['save', 'delete']);
        expect(await outbox.pendingCount()).toBe(0);
    });

    it('keeps retryable failures pending and records the error', async () => {
        const outbox = new Outbox(createMemoryStorage());
        await outbox.enqueue({ kind: 'save', song });
        let calls = 0;
        const result = await outbox.process(async () => { calls++; throw new Error('offline'); });
        expect(result.synced).toBe(0);
        expect(result.failed).toHaveLength(1);
        const pending = await outbox.pending();
        expect(pending).toHaveLength(1);
        expect(pending[0].attempts).toBe(1);
        expect(pending[0].lastError).toBe('offline');
        expect(pending[0].status).toBe('pending');
    });

    it('never drops exhausted operations - they become failed but stay visible', async () => {
        const outbox = new Outbox(createMemoryStorage());
        await outbox.enqueue({ kind: 'save', song });
        for (let i = 0; i < 5; i++) {
            await outbox.process(async () => { throw new Error('nope'); });
        }
        expect(await outbox.pendingCount()).toBe(0);
        const failed = await outbox.failed();
        expect(failed).toHaveLength(1);
        expect(failed[0].status).toBe('failed');
        expect(failed[0].attempts).toBe(5);
        // Failed entries are not auto-retried...
        const result = await outbox.process(async () => {});
        expect(result.synced).toBe(0);
        expect(await outbox.failed()).toHaveLength(1);
    });

    it('retry() moves a failed operation back into the pending queue', async () => {
        const outbox = new Outbox(createMemoryStorage());
        const entry = await outbox.enqueue({ kind: 'save', song });
        await outbox.process(async () => { throw withStatus(new Error('rejected'), 400); });
        expect(await outbox.failed()).toHaveLength(1);
        await outbox.retry(entry.id);
        expect(await outbox.failed()).toHaveLength(0);
        expect(await outbox.pendingCount()).toBe(1);
        const result = await outbox.process(async () => {});
        expect(result.synced).toBe(1);
        expect(await outbox.pendingCount()).toBe(0);
    });

    it('cancel() is the only way to discard an unsynced operation', async () => {
        const outbox = new Outbox(createMemoryStorage());
        const entry = await outbox.enqueue({ kind: 'save', song });
        await outbox.process(async () => { throw withStatus(new Error('bad request'), 400); });
        expect(await outbox.failed()).toHaveLength(1);
        await outbox.cancel(entry.id);
        expect(await outbox.failed()).toHaveLength(0);
        expect(await outbox.pendingCount()).toBe(0);
    });

    it('classifies 4xx as permanent and fails immediately without burning retries', async () => {
        const outbox = new Outbox(createMemoryStorage());
        await outbox.enqueue({ kind: 'save', song });
        const result = await outbox.process(async () => { throw withStatus(new Error('validation'), 422); });
        expect(result.failed[0].status).toBe('failed');
        expect(result.failed[0].attempts).toBe(1);
        expect(result.failed[0].errorKind).toBe('permanent');
    });

    it('keeps operations pending on 401/403 and reports authNeeded without spending attempts', async () => {
        const outbox = new Outbox(createMemoryStorage());
        await outbox.enqueue({ kind: 'save', song });
        const result = await outbox.process(async () => { throw withStatus(new Error('jwt expired'), 401); });
        expect(result.authNeeded).toBe(true);
        expect(result.failed).toHaveLength(0);
        const pending = await outbox.pending();
        expect(pending).toHaveLength(1);
        expect(pending[0].attempts).toBe(0); // auth is not the operation's fault
        expect(pending[0].status).toBe('pending');
        // After re-auth the same entry syncs normally.
        const again = await outbox.process(async () => {});
        expect(again.synced).toBe(1);
        expect(await outbox.pendingCount()).toBe(0);
    });

    it('classifies 401/403 as auth and PostgREST JWT codes as auth', () => {
        expect(classifyError(withStatus(new Error(), 401))).toBe('auth');
        expect(classifyError(withStatus(new Error(), 403))).toBe('auth');
        expect(classifyError(Object.assign(new Error('jwt'), { code: 'PGRST301' }))).toBe('auth');
        expect(classifyError(withStatus(new Error(), 404))).toBe('permanent');
    });

    it('treats 408, 429 and 5xx as retryable', () => {
        expect(classifyError(withStatus(new Error(), 408))).toBe('retryable');
        expect(classifyError(withStatus(new Error(), 429))).toBe('retryable');
        expect(classifyError(withStatus(new Error(), 503))).toBe('retryable');
        expect(classifyError(new TypeError('Failed to fetch'))).toBe('retryable');
    });

    it('isolates the queue per account - no cross-account visibility or replay', async () => {
        const storage = createMemoryStorage();
        const alice = new Outbox(storage, 'alice@example.com');
        await alice.enqueue({ kind: 'save', song });

        const bob = new Outbox(storage, 'bob@example.com');
        expect(await bob.pending()).toHaveLength(0);
        const applied: OutboxOperation[] = [];
        await bob.process(async (op) => { applied.push(op); });
        expect(applied).toHaveLength(0);

        // Switching the same outbox instance (logout/login) re-scopes it.
        alice.setAccount('bob@example.com');
        expect(await alice.pending()).toHaveLength(0);
        alice.setAccount('alice@example.com');
        expect(await alice.pending()).toHaveLength(1);
    });

    it('skips duplicates instead of applying an operation twice', async () => {
        const outbox = new Outbox(createMemoryStorage());
        await outbox.enqueue({ kind: 'save', song });
        let applied = 0;
        const result = await outbox.process(
            async () => { applied++; },
            { isDuplicate: async () => true },
        );
        expect(applied).toBe(0);
        expect(result.skippedDuplicates).toBe(1);
        expect(await outbox.pendingCount()).toBe(0);
    });
});
