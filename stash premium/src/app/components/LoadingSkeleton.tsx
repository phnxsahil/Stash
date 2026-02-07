export default function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-[#1D1D1F] rounded-lg border border-gray-800"
        >
          {/* Album Art Skeleton */}
          <div className="w-16 h-16 rounded skeleton flex-shrink-0" />

          {/* Song Info Skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-700 rounded skeleton w-3/4" />
            <div className="h-4 bg-gray-700 rounded skeleton w-1/2" />
            <div className="h-3 bg-gray-700 rounded skeleton w-1/3" />
          </div>

          {/* Actions Skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg skeleton" />
            <div className="w-10 h-10 rounded-lg skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}
