import { Icon as StashIcon, StashLogo } from './stitch/StashUI';
import React, { useState, useRef } from 'react';
import { Instagram, Download, Share2 } from './stitch/StashIcons';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import html2canvas from 'html2canvas';

// Shared component for 1:1 fidelity between preview and export
const InstagramStoryCard = React.forwardRef<HTMLDivElement, {
  totalSongs: number;
  genreData?: { name: string; value: number; color: string }[];
  streak?: number;
  style?: React.CSSProperties;
  className?: string;
}>(({ totalSongs, genreData = [], streak = 0, style, className }, ref) => {
  return (
    <div
      ref={ref}
      className={`aspect-[9/16] relative overflow-hidden shrink-0 ${className || ''}`}
      style={{
        background: 'var(--st-surface)',
        fontFamily: 'var(--st-font)',
        color: 'var(--st-text)',
        display: 'flex',
        flexDirection: 'column',
        padding: '8% 8%',
        ...style
      }}
    >
      {/* Background Pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '5%', left: '5%', width: '30%', paddingBottom: '30%', borderRadius: '9999px', backgroundColor: '#ffffff', filter: 'blur(64px)' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '40%', paddingBottom: '40%', borderRadius: '9999px', backgroundColor: '#ffffff', filter: 'blur(64px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '8px 16px', borderRadius: '9999px',
            backgroundColor: 'var(--st-low)', backdropFilter: 'blur(12px)'
          }}>
            <div style={{ width: 32, height: 32, backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StashLogo wordmark={false} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Stash</span>
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--st-text)', lineHeight: 1.2 }}>My Music Stats</h2>
          <p style={{ fontSize: '16px', color: 'var(--st-muted)' }}>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center' }}>
          {/* Main Stat */}
          <div style={{
            textAlign: 'center', padding: '32px', borderRadius: '32px',
            backgroundColor: 'var(--st-low)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--st-muted)' }}>Total Stashes</p>
            <p style={{ fontSize: '96px', fontWeight: 900, lineHeight: 1, letterSpacing: '-2px', color: 'var(--st-text)', margin: 0 }}>{totalSongs}</p>
            <p style={{ fontSize: '16px', marginTop: '12px', color: 'var(--st-muted)' }}>Songs Discovered</p>
          </div>

          {/* Secondary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{
              padding: '24px', textAlign: 'center', borderRadius: '24px',
              backgroundColor: 'var(--st-low)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <p style={{ margin: '0 0 8px 0', color: 'var(--st-primary)' }}><StashIcon name="local_fire_department" size={48} /></p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: 'var(--st-text)' }}>{streak}</p>
              <p style={{ fontSize: '14px', margin: '4px 0 0 0', color: 'var(--st-muted)' }}>Day Streak</p>
            </div>
            <div style={{
              padding: '24px', textAlign: 'center', borderRadius: '24px',
              backgroundColor: 'var(--st-low)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <p style={{ margin: '0 0 8px 0', color: 'var(--st-primary)' }}><StashIcon name="music_note" size={48} /></p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: 'var(--st-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{genreData[0]?.name || 'No genre data'}</p>
              <p style={{ fontSize: '14px', margin: '4px 0 0 0', color: 'var(--st-muted)' }}>Top Genre</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--st-muted)' }}>The internet is the world's radio</p>
          <p style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--st-text)' }}>stash.app</p>
        </div>
      </div>
    </div>
  );
});

InstagramStoryCard.displayName = 'InstagramStoryCard';

interface InstagramExportProps {
  totalSongs: number;
  genreData?: { name: string; value: number; color: string }[];
  topArtists?: { name: string; art: string; count: number }[];
  streak?: number;
  compact?: boolean;
}

export function InstagramExport({
  totalSongs,
  genreData = [],
  topArtists = [],
  streak = 0,
  compact = false
}: InstagramExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const generateImage = async (): Promise<Blob | null> => {
    if (!exportRef.current) return null;

    try {
      // Generate canvas from the HIDDEN high-res container
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Force all oklch colors to hex equivalents to prevent html2canvas crash
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            const style = window.getComputedStyle(el);
            if (style.backgroundColor.includes('oklch')) el.style.backgroundColor = '#000000';
            if (style.color.includes('oklch')) el.style.color = '#ffffff';
            if (style.borderColor.includes('oklch')) el.style.borderColor = '#333333';
          }
        }
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    } catch (error) {
      console.error('Generation failed:', error);
      return null;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await generateImage();
      if (!blob) throw new Error('Failed to generate image');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `stash-stats-${Date.now()}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      setIsOpen(false);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      setIsExporting(true);
      try {
        const blob = await generateImage();
        if (!blob) throw new Error('Failed to generate image');

        const file = new File([blob], 'stash-stats.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Stash Stats',
            text: `I've stashed ${totalSongs} songs! Check out my music discovery stats 🎵`,
          });
        } else {
          await navigator.share({
            title: 'My Stash Stats',
            text: `I've stashed ${totalSongs} songs! Check out my music discovery stats 🎵`,
            url: window.location.href,
          });
        }
      } catch (error) {
        console.log('Share cancelled or failed', error);
      } finally {
        setIsExporting(false);
      }
    } else {
      handleExport();
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        aria-label={compact ? "Share analytics" : undefined}
        className={compact ? "st-stats-share" : "st-export-trigger"}
      >
        <StashIcon name="ios_share" size={20} />
        {!compact && 'Export to Instagram'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="stitch-theme st-share-dialog border-border w-fit max-w-[95vw] p-6">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Instagram className="w-5 h-5 text-[#E1306C]" />
              Export Stats to Instagram
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Share your music discovery stats on Instagram Stories.
            </DialogDescription>
          </DialogHeader>

          {/* HIDDEN EXPORT CONTAINER (Source of Truth) */}
          <div style={{ position: 'absolute', top: -9999, left: -9999, pointerEvents: 'none' }}>
            <InstagramStoryCard
              ref={exportRef}
              totalSongs={totalSongs}
              genreData={genreData}
              streak={streak}
              style={{
                width: '540px',
                height: '960px',
              }}
            />
          </div>

          {/* VISIBLE PREVIEW */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex justify-center w-full">
              <InstagramStoryCard
                totalSongs={totalSongs}
                genreData={genreData}
                streak={streak}
                className="rounded-2xl shadow-2xl"
                style={{
                  height: 'min(70vh, 600px)',
                  width: 'auto',
                }}
              />
            </div>

            <div className="flex gap-3 w-full max-w-sm">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 bg-primary text-primary-foreground"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Download Image'}
              </Button>

              {typeof navigator.share === 'function' && (
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-white/20 hover:bg-white/10"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center max-w-xs">
              📱 Download and share on Instagram Stories<br />
              Pro tip: Use the sticker tool to add #Stash
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
