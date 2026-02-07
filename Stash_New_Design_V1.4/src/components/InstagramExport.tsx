import { useState } from 'react';
import { motion } from 'motion/react';
import { Instagram, Download, Share2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import html2canvas from 'html2canvas';

interface InstagramExportProps {
  totalSongs: number;
  genreData?: { name: string; value: number; color: string }[];
  topArtists?: { name: string; image: string }[];
  streak?: number;
}

export function InstagramExport({ 
  totalSongs, 
  genreData = [],
  topArtists = [],
  streak = 7
}: InstagramExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const element = document.getElementById('instagram-card');
      if (!element) {
        throw new Error('Card not found');
      }

      // Generate canvas from HTML
      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2, // Higher quality
        logging: false,
      });

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) return;

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `stash-stats-${Date.now()}.png`;
        link.href = url;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        
        // Show success message
        alert('✨ Your stats card has been downloaded! Share it on Instagram Stories 🎵');
        setIsOpen(false);
      }, 'image/png');
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    // For devices that support Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Stash Stats',
          text: `I've stashed ${totalSongs} songs! Check out my music discovery stats 🎵`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to export
      handleExport();
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:border-purple-500/30"
      >
        <Instagram className="w-4 h-4 mr-2" />
        Export to Instagram
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-black border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              Export Stats to Instagram
            </DialogTitle>
          </DialogHeader>

          {/* Instagram Story Card */}
          <div className="space-y-4">
            {/* Preview */}
            <div 
              id="instagram-card"
              className="w-full aspect-[9/16] bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-8 relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between text-white">
                {/* Header */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📻</span>
                    </div>
                    <span className="font-bold text-lg">Stash</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">My Music Stats</h2>
                  <p className="text-white/80 text-sm">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="space-y-6">
                  {/* Main Stat */}
                  <div className="text-center bg-white/20 backdrop-blur-md rounded-3xl p-6">
                    <p className="text-white/80 text-sm mb-2">Total Stashes</p>
                    <p className="text-7xl font-black">{totalSongs}</p>
                    <p className="text-white/80 text-sm mt-2">Songs Discovered</p>
                  </div>

                  {/* Secondary Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                      <p className="text-4xl font-bold mb-1">🔥</p>
                      <p className="text-2xl font-bold">{streak}</p>
                      <p className="text-white/80 text-xs">Day Streak</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                      <p className="text-4xl font-bold mb-1">🎵</p>
                      <p className="text-2xl font-bold">{genreData[0]?.name || 'Pop'}</p>
                      <p className="text-white/80 text-xs">Top Genre</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                  <p className="text-white/60 text-xs mb-2">The internet is the world's radio</p>
                  <p className="text-white font-bold text-sm">stash.app</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Download Image'}
              </Button>
              
              {navigator.share && (
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-white/20 hover:bg-white/10"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center">
              📱 Download and share on Instagram Stories<br/>
              Pro tip: Use the sticker tool to add #Stash
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
