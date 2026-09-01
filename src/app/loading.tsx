export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Announcement bar skeleton */}
      <div className="bg-[#212529] h-9 animate-pulse" />
      {/* Header skeleton */}
      <div className="bg-white border-b h-16 flex items-center px-6">
        <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="ml-auto flex gap-3">
          <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-violet-900 to-indigo-900 h-[420px] animate-pulse" />
      {/* Categories skeleton */}
      <div className="flex gap-4 max-w-7xl mx-auto px-6 py-6 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
        ))}
      </div>
      {/* Features skeleton */}
      <div className="grid md:grid-cols-3 gap-4 max-w-7xl mx-auto px-6 py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[220px] rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>
      {/* Product grid skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div>
            <div className="w-40 h-5 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="w-56 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border overflow-hidden">
              <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
              <div className="p-3.5">
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse mb-3" />
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
  );
}