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
      <div className="surface-panel p-10 text-center md:p-20">
        <div className="size-16 mx-auto rounded-3xl bg-primary/5 grid place-items-center mb-6 shadow-sm border border-border/40">
          <Clock3 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Your stash is empty</h2>
        <p className="text-muted-foreground font-medium max-w-sm mx-auto">Paste the first link above and start building a library that survives the scroll.</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/6 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          <Radio className="h-3.5 w-3.5" />
          Ready for your first save
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-label="Stash history">
      <div className="flex items-center justify-between px-1 md:px-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Library</p>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Recent Stashes</h2>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-primary">{history.length} Saved</p>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4">
        {history.map((song) => (
          <article
            key={song.id}
            className="surface-panel group flex items-center gap-3 px-4 py-3.5 transition-all hover:scale-[1.01] active:scale-[0.99] md:gap-6 md:px-5 md:py-4.5"
          >
            <div className="relative shrink-0">
              <img src={song.album_art_url} alt={song.song} className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border border-border/40 shadow-sm transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none" />
            </div>
            
            <div className="flex-1 min-w-0 pr-1">
              <p className="truncate text-[0.98rem] font-bold tracking-tight md:text-lg">{song.song}</p>
              <p className="mt-0.5 truncate text-sm font-medium text-muted-foreground">{song.artist}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-lg bg-background/50 border border-border/30">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <p className="text-[10px] uppercase tracking-[0.12em] font-bold text-muted-foreground">{song.source}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteSong(song.id)}
              className="h-9 w-9 shrink-0 rounded-full text-muted-foreground opacity-100 transition-colors hover:bg-destructive/5 hover:text-destructive md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
              aria-label={`Remove ${song.song} from stash`}
            >
              <Trash2 className="w-4.5 h-4.5" />
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
