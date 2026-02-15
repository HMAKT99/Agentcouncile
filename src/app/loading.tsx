export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="animate-pulse space-y-8">
        <div className="text-center">
          <div className="h-10 bg-surface rounded w-1/3 mx-auto mb-4" />
          <div className="h-5 bg-surface rounded w-1/2 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card">
              <div className="h-6 bg-surface-elevated rounded w-3/4 mb-4" />
              <div className="h-4 bg-surface-elevated rounded w-full mb-2" />
              <div className="h-4 bg-surface-elevated rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
