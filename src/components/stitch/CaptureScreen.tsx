import type { FormEvent, RefObject } from 'react';
import type { Song } from '../../types';
import { TrackArtwork } from '../TrackArtwork';
import { Icon, relativeStashDate, StashBadge, StashButton, StashCard } from './StashUI';

interface CaptureScreenProps {
  id: string; url: string; busy: boolean; error: string;
  inputRef: RefObject<HTMLInputElement>;
  onSubmit: (event: FormEvent) => void;
  onUrlChange: (value: string) => void;
  onClear: () => void; onPaste: () => void;
  destinationName?: string; onChangeDestination?: () => void;
  recentSong?: Song;
}

export function CaptureScreen({ id, url, busy, error, inputRef, onSubmit, onUrlChange, onClear, onPaste, destinationName, onChangeDestination, recentSong }: CaptureScreenProps) {
  const source = /instagram\.com/i.test(url) ? 'Instagram Reel' : /youtu(?:\.be|be\.com)/i.test(url) ? 'YouTube Shorts' : /tiktok\.com/i.test(url) ? 'TikTok' : '';
  return <div className="st-capture-content">
    <div className="st-capture-intro"><div className="st-heading-line"><h1>Capture</h1><span className="st-capture-cast"><Icon name="music_cast" size={20} filled /></span></div><p>Paste a Reel, Short, or TikTok to extract the track directly to Spotify.</p></div>
    <form onSubmit={onSubmit} noValidate aria-busy={busy} className="st-capture-form">
      <StashCard className="st-source-card"><div className="st-source-header"><label htmlFor={`${id}-url`} className="st-label">Source link</label><div className="st-platforms" aria-label="Supported platforms">{[['photo_camera', 'Instagram', 'Instagram Reel'], ['smart_display', 'YouTube Shorts', 'YouTube Shorts'], ['graphic_eq', 'TikTok', 'TikTok']].map(([icon, label, platform]) => <span key={icon} title={label} className={source === platform ? 'is-active' : ''}><Icon name={icon} size={14} /></span>)}</div></div>
        <div className="st-url-field"><Icon name="link" size={20} /><input ref={inputRef} id={`${id}-url`} type="url" inputMode="url" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Paste Instagram, YouTube, or TikTok URL..." value={url} disabled={busy} aria-label="Music source URL" aria-invalid={!!error} aria-describedby={error ? `${id}-feedback` : undefined} onChange={event => onUrlChange(event.target.value)} /><button type="button" disabled={busy} aria-label="Clear link" onClick={onClear}><Icon name="close" size={14} /></button></div>
        <div className="st-source-actions"><StashButton type="button" onClick={onPaste} disabled={busy}><Icon name="content_paste" size={16} />Paste from clipboard</StashButton>{source && <StashBadge>{source}</StashBadge>}</div>
        {error && <p id={`${id}-feedback`} className="st-feedback" role="alert">{error}</p>}
      </StashCard>
      <div className="st-destination-group"><p className="st-label">Destination</p><StashCard className="st-destination"><span className="st-destination-icon"><Icon name="favorite" size={22} filled /></span><div className="st-destination-copy"><strong>{destinationName}</strong><p>{destinationName === 'Liked Songs' ? 'Default library collection' : 'Your Spotify playlist'}</p></div><StashButton type="button" variant="ghost" onClick={onChangeDestination}>Change<Icon name="chevron_right" size={18} /></StashButton></StashCard></div>
      <div className="st-capture-submit"><StashButton variant="primary" type="submit" disabled={busy}><Icon name={busy ? 'progress_activity' : 'bolt'} size={22} filled className={busy ? 'st-spin' : ''} />{busy ? 'Finding your song…' : 'Stash to Spotify'}</StashButton></div>
    </form>
    <StashCard className="st-recent"><div className="st-recent-heading"><span className="st-label"><Icon name="history" size={16} />Recent stash</span>{recentSong && <time dateTime={recentSong.created_at}>{relativeStashDate(recentSong.created_at)}</time>}</div>{recentSong ? <div className="st-recent-track"><TrackArtwork url={recentSong.album_art_url} /><div className="st-recent-copy"><strong>{recentSong.song}<Icon name="check_circle" size={16} filled /></strong><p>{recentSong.artist}</p></div>{recentSong.spotify_url?.startsWith('https://open.spotify.com/') && <a className="st-open-track" href={recentSong.spotify_url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${recentSong.song} in Spotify`}><Icon name="open_in_new" size={18} /></a>}</div> : <p className="st-recent-empty">Your next discovery will appear here.</p>}</StashCard>
    <div className="st-share-tip"><span><Icon name="ios_share" size={16} /></span><p>You can also share directly from Instagram or YouTube with the iOS Share Sheet to stash songs in one tap.</p></div>
  </div>;
}
