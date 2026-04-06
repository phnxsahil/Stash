import { Clock3, Radio, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Song } from '../lib/api';

interface HistoryListProps {
  history: Song[];
  onDeleteSong: (id: string) => void;
}

export function HistoryList({ history, onDeleteSong }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="surface-panel p-12 md:p-20 text-center">
        <div className="size-16 mx-auto rounded-3xl bg-primary/5 grid place-items-center mb-6 shadow-sm border border-border/40">
          <Clock3 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Your stash is empty</h2>
        <p className="text-muted-foreground font-medium max-w-sm mx-auto">Paste your first link above and start building your impeccable music library.</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/6 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          <Radio className="h-3.5 w-3.5" />
          Private beta access
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-label="Stash history">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold tracking-tight">Recent Stashes</h2>
        <div className="px-3 py-1 rounded-full bg-primary/5 border border-border/40">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">{history.length} Saved</p>
        </div>
      </div>

      <div className="grid gap-4">
        {history.map((song) => (
          <article
            key={song.id}
            className="surface-panel p-4 md:p-5 flex items-center gap-4 md:gap-6 hover:scale-[1.01] active:scale-[0.99] transition-all group"
          >
            <div className="relative shrink-0">
              <img src={song.album_art_url} alt={song.song} className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border border-border/40 shadow-sm transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base md:text-lg truncate tracking-tight">{song.song}</p>
              <p className="text-sm text-muted-foreground font-semibold truncate mt-0.5">{song.artist}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-lg bg-background/50 border border-border/30">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-muted-foreground">{song.source}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteSong(song.id)}
              className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label={`Remove ${song.song} from stash`}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
