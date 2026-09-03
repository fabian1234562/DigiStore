export default function TiendaLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header skeleton */}
      <div className="bg-white border-b h-16 flex items-center px-6">
        <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
        <div className="w-24 h-5 bg-gray-200 rounded animate-pulse ml-2" />
      </div>
      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 h-28 animate-pulse" />
      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar skeleton */}
          <div className="hidden md:block w-56 shrink-0">
            <div className="bg-white rounded-2xl border p-4 space-y-4">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-full h-8 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          {/* Grid skeleton */}
          <div className="flex-1">
            <div className="w-full h-10 bg-white rounded-xl border animate-pulse mb-4" />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                  <div className="p-3">
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="flex justify-between">
                      <div className="w-14 h-5 bg-gray-200 rounded animate-pulse" />
                      <div className="w-16 h-8 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
