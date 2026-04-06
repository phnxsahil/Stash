type LoadingSkeletonVariant = 'shell' | 'history' | 'stats';

interface LoadingSkeletonProps {
  variant?: LoadingSkeletonVariant;
  lines?: number;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted/80 ${className}`} />;
}

export default function LoadingSkeleton({
  variant = 'history',
  lines = 3,
}: LoadingSkeletonProps) {
  if (variant === 'shell') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-border/40 bg-background/70 backdrop-blur-2xl">
          <div className="container mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SkeletonBlock className="h-11 w-11 rounded-2xl" />
                <div className="space-y-2">
                  <SkeletonBlock className="h-3 w-20 rounded-full" />
                  <SkeletonBlock className="h-4 w-32" />
                </div>
              </div>
              <SkeletonBlock className="h-10 w-28 rounded-full" />
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-8 md:py-14">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="surface-panel p-5 md:p-6">
                <SkeletonBlock className="mb-4 h-11 w-11 rounded-2xl" />
                <SkeletonBlock className="mb-2 h-8 w-16" />
                <SkeletonBlock className="h-3 w-24 rounded-full" />
              </div>
            ))}
          </div>

          <div className="surface-panel p-6 md:p-8">
            <SkeletonBlock className="mb-3 h-4 w-36 rounded-full" />
            <SkeletonBlock className="mb-3 h-11 w-full rounded-2xl" />
            <SkeletonBlock className="h-11 w-40 rounded-2xl" />
          </div>

          <LoadingSkeleton variant="history" lines={4} />
        </div>
      </div>
    );
  }

  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-3 gap-4 md:gap-6" aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <div key={item} className="surface-panel p-5 md:p-7 text-center">
            <SkeletonBlock className="mx-auto mb-4 h-12 w-12 rounded-2xl md:h-14 md:w-14" />
            <SkeletonBlock className="mx-auto mb-2 h-8 w-16" />
            <SkeletonBlock className="mx-auto h-3 w-24 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="surface-panel flex items-center gap-4 p-4 md:p-5"
        >
          <SkeletonBlock className="h-14 w-14 shrink-0 rounded-2xl md:h-16 md:w-16" />

          <div className="min-w-0 flex-1 space-y-2.5">
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
            <SkeletonBlock className="h-3 w-1/3 rounded-full" />
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <SkeletonBlock className="h-10 w-10 rounded-full" />
            <SkeletonBlock className="h-10 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
