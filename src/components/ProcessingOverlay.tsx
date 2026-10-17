import { useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, CheckCircle2, Unplug, X } from './stitch/StashIcons';
import { Vinyl } from './Vinyl';
import '../styles/capture.css';

interface ProcessingOverlayProps {
  isVisible: boolean;
  stage: 1 | 2 | 3 | 'success' | 'error';
  errorMessage?: string;
  onClose?: () => void;
  onRetry?: () => void;
}

const stages = [
  { title: 'Listening to your link', description: 'Getting the audio ready. Good finds are worth a moment.', label: 'Listen' },
  { title: 'Finding your song', description: 'Matching the music in your clip to a track.', label: 'Identify' },
  { title: 'Checking Spotify', description: 'Looking for the track on Spotify. Almost there.', label: 'Match' },
];

export function ProcessingOverlay({ isVisible, stage, errorMessage, onClose, onRetry }: ProcessingOverlayProps) {
  const isError = stage === 'error';
  const isSuccess = stage === 'success';
  const activeStage = typeof stage === 'number' ? stage - 1 : 2;
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isVisible || !isSuccess || !onClose) return;
    const timer = setTimeout(onClose, 2200);
    return () => clearTimeout(timer);
  }, [isVisible, isSuccess, onClose]);

  return <Dialog.Root open={isVisible} onOpenChange={open => { if (!open && isError) onClose?.(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="capture-dialog-overlay" />
      <Dialog.Content className="capture-dialog stitch-theme st-processing"
        onOpenAutoFocus={() => { returnFocus.current = document.activeElement as HTMLElement; }}
        onInteractOutside={event => event.preventDefault()}
        onEscapeKeyDown={event => { if (!isError) event.preventDefault(); }}
        onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus(); }}>
        {isError && onClose && <button className="capture-dialog-close" onClick={onClose} aria-label="Close and edit link"><X size={20} /></button>}
        {isError ? <div className="capture-status-icon is-error"><Unplug size={36} aria-hidden="true" /></div>
          : isSuccess ? <div className="capture-status-icon"><CheckCircle2 size={42} aria-hidden="true" /></div>
          : <Vinyl spinning />}
        <div role="status" aria-live="polite" aria-atomic="true">
          <Dialog.Title>{isError ? 'This one needs another try' : isSuccess ? 'Found your song.' : stages[activeStage].title}</Dialog.Title>
          <Dialog.Description className="capture-dialog-description">
            {isError ? errorMessage || 'We couldn’t find a match. Check that the link is public, then try again.'
              : isSuccess ? 'Your match is ready. Next up: saving it to Spotify.' : stages[activeStage].description}
          </Dialog.Description>
        </div>
        {!isError && !isSuccess && <>
          <ol className="capture-stage-list" aria-label="Recognition progress">
            {stages.map((item, index) => <li key={item.label} aria-current={index === activeStage ? 'step' : undefined}>
              {index < activeStage && <Check size={12} aria-label="Complete" />}{item.label}
            </li>)}
          </ol>
          <div className="capture-track-skeleton" aria-hidden="true">
            <div className="capture-shimmer capture-skeleton-art" />
            <div className="capture-skeleton-lines"><div className="capture-shimmer" /><div className="capture-shimmer" /></div>
          </div>
          <p className="capture-dialog-hint">Keep this window open while we listen.</p>
        </>}
        {isError && onRetry && <button className="capture-primary" onClick={onRetry}>Try again</button>}
        {isError && <p className="capture-dialog-hint">Your link is safe. Close this to edit it.</p>}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
