export default function LoadingArticleDetail() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white">
              {/* Featured image skeleton */}
              <div className="w-full aspect-video bg-gray-200 mb-8" />

              <div className="px-8 pb-12">
                {/* Article meta skeleton */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-28" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>

                {/* Title skeleton */}
                <div className="mb-6">
                  <div className="h-9 bg-gray-200 rounded w-full mb-3" />
                  <div className="h-9 bg-gray-200 rounded w-2/3" />
                </div>

                {/* Excerpt/highlight block skeleton */}
                <div className="bg-blue-50 border-l-4 border-gray-200 p-4 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                </div>

                {/* Tags skeleton */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-7 bg-gray-200 rounded-full w-20" />
                  ))}
                </div>

                {/* Content skeleton */}
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/3 mt-6 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-6 bg-gray-200 rounded w-1/4 mt-6 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                </div>
              </div>
            </div>

            {/* Related articles skeleton */}
            <div className="mt-16">
              <div className="h-7 bg-gray-200 rounded w-40 mb-8 mx-8" />
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4">
                    <div className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                      <div className="h-5 bg-gray-200 rounded w-full mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar skeleton - 1/3 width */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full" />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-16 h-12 bg-gray-200 rounded flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
