export default function LoadingJobDetail() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-28" />
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-36" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              {/* Company & title */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-7 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>

              {/* Job meta tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="h-7 bg-gray-200 rounded-full w-24" />
                <div className="h-7 bg-gray-200 rounded-full w-28" />
                <div className="h-7 bg-gray-200 rounded-full w-20" />
                <div className="h-7 bg-gray-200 rounded-full w-32" />
              </div>

              {/* Job details grid */}
              <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-1" />
                    <div className="h-5 bg-gray-200 rounded w-32" />
                  </div>
                ))}
              </div>

              {/* Description section */}
              <div className="mb-6">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>

              {/* Requirements section */}
              <div className="mb-6">
                <div className="h-6 bg-gray-200 rounded w-36 mb-4" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply button skeleton */}
              <div className="h-12 bg-gray-200 rounded-lg w-48 mt-8" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company info card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>

            {/* Similar jobs card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="h-5 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
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
