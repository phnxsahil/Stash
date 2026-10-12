import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, Disc3, Music2, RefreshCw, Search, Trash2, X } from 'lucide-react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Song } from '../lib/api';
import { TrackArtwork } from './TrackArtwork';

interface HistoryListProps {
  history: Song[];
  onDeleteSong: (id: string) => void;
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => Promise<void>;
  onCapture?: () => void;
}

function stashDate(value?: string) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return {label:'Date unavailable', full:'Date unavailable'};
  const now = new Date();
  const yesterday = new Date(); yesterday.setDate(now.getDate()-1);
  const label = date.toDateString() === now.toDateString() ? 'Today' : date.toDateString() === yesterday.toDateString() ? 'Yesterday'
    : new Intl.DateTimeFormat(undefined, {month:'short',day:'numeric', ...(date.getFullYear() !== now.getFullYear() ? {year:'numeric' as const} : {})}).format(date);
  return {label,full:date.toLocaleString()};
}

function TrackCard({ song, index, onDeleteSong }: { song: Song; index: number; onDeleteSong: (id:string)=>void }) {
  const reduced = useReducedMotion();
  const date = stashDate(song.created_at);
  const spotifyUrl = song.spotify_url?.startsWith('https://open.spotify.com/') ? song.spotify_url : undefined;
  return <motion.article className="track-card" initial={reduced ? false : {opacity:0,y:18}}
    whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.08}}
    exit={reduced ? undefined : {opacity:0,scale:.96}} transition={{duration:.35,delay:(index % 6)*.035}}>
    <TrackArtwork url={song.album_art_url} />
    <div className="track-details">
      <h3 title={song.song}>{song.song}</h3><p title={song.artist}>{song.artist}</p>
      <div className="track-meta"><span>{song.source || 'Link'}</span><span aria-hidden="true">·</span><time dateTime={song.created_at} title={date.full}>{date.label}</time></div>
    </div>
    <div className="track-actions">
      {spotifyUrl && <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${song.song} in Spotify`}><ArrowUpRight size={19} aria-hidden="true" /></a>}
      <AlertDialog.Root>
        <AlertDialog.Trigger asChild><button aria-label={`Remove ${song.song} from stash`}><Trash2 size={16} aria-hidden="true" /></button></AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="capture-dialog-overlay" />
          <AlertDialog.Content className="capture-dialog capture-theme library-remove-dialog">
            <div className="capture-status-icon"><Disc3 size={36} /></div>
            <AlertDialog.Title>Remove this find?</AlertDialog.Title>
            <AlertDialog.Description className="capture-dialog-description">“{song.song}” will leave your Stash history. Your Spotify library and playlists will stay unchanged.</AlertDialog.Description>
            <div className="remove-actions"><AlertDialog.Cancel className="library-secondary">Keep it</AlertDialog.Cancel>
              <AlertDialog.Action className="capture-primary" onClick={()=>onDeleteSong(song.id)}>Remove</AlertDialog.Action></div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  </motion.article>;
}

export function HistoryList({ history, onDeleteSong, isLoading = false, error, onRefresh, onCapture }: HistoryListProps) {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('All sources');
  const [sort, setSort] = useState('newest');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [armed, setArmed] = useState(false);
  const busy = useRef(false);
  const listRef = useRef<HTMLElement>(null);
  const pull = useMotionValue(0);
  const reduced = useReducedMotion();
  const id = useId();
  const sources = useMemo(()=>Array.from(new Set(history.map(song=>song.source).filter(Boolean))).sort(),[history]);
  useEffect(()=>{if(source !== 'All sources' && !sources.includes(source)) setSource('All sources');},[sources,source]);
  const filtered = useMemo(()=>history.filter(song => `${song.song} ${song.artist}`.toLowerCase().includes(query.trim().toLowerCase()) && (source === 'All sources' || source === song.source))
    .sort((a,b)=>sort === 'title' ? a.song.localeCompare(b.song) : (sort === 'oldest' ? 1 : -1) * ((Date.parse(a.created_at || '') || 0) - (Date.parse(b.created_at || '') || 0))),[history,query,source,sort]);

  const refreshRef = useRef<()=>Promise<void>>(async()=>{});
  refreshRef.current = async () => {
    if (!onRefresh || busy.current || isLoading) return;
    busy.current = true; setRefreshing(true); setRefreshError('');
    try { await onRefresh(); } catch { setRefreshError('Couldn’t refresh your stash. Try again.'); }
    finally { busy.current = false; setRefreshing(false); }
  };

  useEffect(()=>{
    const element = listRef.current;
    if (!element || !onRefresh) return;
    let startY = 0, startX = 0, tracking = false, distance = 0;
    const start = (event: TouchEvent) => {
      if (busy.current || isLoading || window.scrollY > 1 || event.touches.length !== 1 || (event.target as HTMLElement).closest('input,select,button,a')) return;
      tracking = true; startY = event.touches[0].clientY; startX = event.touches[0].clientX;
    };
    const move = (event: TouchEvent) => {
      if (!tracking) return;
      const dy = event.touches[0].clientY-startY;
      if (Math.abs(event.touches[0].clientX-startX)>Math.abs(dy)) { tracking=false; return; }
      if (dy<=0) return;
      if (event.cancelable) event.preventDefault();
      distance = Math.min(dy*.45,90); pull.set(reduced ? 0 : distance); setArmed(distance>=60);
    };
    const end = () => {
      if (tracking && distance>=60) void refreshRef.current();
      tracking=false; distance=0; pull.set(0); setArmed(false);
    };
    const cancel = () => { tracking=false; distance=0; pull.set(0); setArmed(false); };
    element.addEventListener('touchstart',start,{passive:true}); element.addEventListener('touchmove',move,{passive:false});
    element.addEventListener('touchend',end); element.addEventListener('touchcancel',cancel);
    return ()=>{element.removeEventListener('touchstart',start);element.removeEventListener('touchmove',move);element.removeEventListener('touchend',end);element.removeEventListener('touchcancel',cancel);};
  },[onRefresh,pull,reduced,isLoading]);

  return <section ref={listRef} className="history-library" aria-label="Stash history" aria-busy={isLoading || refreshing}>
    <div className="history-toolbar">
      <div className="library-search"><Search size={18} aria-hidden="true" /><input id={`${id}-search`} aria-label="Search your stash" placeholder="Search songs or artists" value={query} onChange={event=>setQuery(event.target.value)} />
        {query && <button aria-label="Clear search" onClick={()=>setQuery('')}><X size={17} /></button>}
      </div>
      <div className="library-filters">
        <select aria-label="Filter by source" value={source} onChange={event=>setSource(event.target.value)}><option>All sources</option>{sources.map(item=><option key={item}>{item}</option>)}</select>
        <select aria-label="Sort stash" value={sort} onChange={event=>setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Song title</option></select>
        {onRefresh && <button className="library-refresh" aria-label="Refresh stash" onClick={()=>void refreshRef.current()} disabled={refreshing || isLoading}><RefreshCw size={18} aria-hidden="true" className={refreshing ? 'is-spinning' : ''} /></button>}
      </div>
    </div>
    <div className="library-result-line"><span>{isLoading && !history.length ? 'Loading your finds…' : error && !history.length ? 'Collection unavailable' : `${filtered.length} ${filtered.length === 1 ? 'song' : 'songs'}${query || source !== 'All sources' ? ' found' : ' in your collection'}`}</span><span>GOOD FINDS, KEPT.</span></div>
    <div className="library-refresh-feedback" role="status" aria-live="polite">{armed ? 'Release to refresh' : refreshing ? 'Refreshing your stash…' : ''}</div>
    {(error || refreshError) && <div className="library-error" role="alert"><div><strong>Your stash couldn’t load.</strong><p>{error || refreshError}</p></div><button className="library-secondary" disabled={refreshing} onClick={()=>void refreshRef.current()}>Try again</button></div>}
    <motion.div style={{y:pull}}>
      {isLoading && !history.length ? <div className="track-grid" aria-label="Loading songs">{Array.from({length:6},(_,index)=><div className="track-card track-skeleton" key={index} aria-hidden="true"><div className="track-artwork capture-shimmer" /><div className="track-details"><div className="capture-shimmer" /><div className="capture-shimmer" /><div className="capture-shimmer" /></div></div>)}</div>
        : !history.length && !error ? <div className="library-empty"><div className="empty-records" aria-hidden="true"><Disc3 /></div><h2>Your best finds are still ahead.</h2><p>That song stuck in your head? Give it a home.<br />Paste your first link and start your collection.</p><button className="capture-primary" onClick={onCapture}>Find your first song <ArrowUpRight size={18} /></button></div>
        : history.length > 0 && !filtered.length ? <div className="library-empty search-empty"><Search size={32} aria-hidden="true" /><h2>No songs found.</h2><p>Try another title, artist, or source.</p><button className="library-secondary" onClick={()=>{setQuery('');setSource('All sources');}}>Clear filters</button></div>
        : <div className="track-grid"><AnimatePresence initial={false}>{filtered.map((song,index)=><TrackCard key={song.id} song={song} index={index} onDeleteSong={onDeleteSong} />)}</AnimatePresence></div>}
    </motion.div>
    {history.length > 0 && filtered.length > 0 && <p className="library-end"><Check size={14} aria-hidden="true" /> You’re all caught up. Go find something good.</p>}
  </section>;
              }
