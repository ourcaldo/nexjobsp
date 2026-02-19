export default function LoadingJobProvince() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-28" />
        </div>

        {/* Location header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-2/5 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/5" />
        </div>

        {/* Search/filter bar skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="h-10 bg-gray-200 rounded-lg w-full mb-4" />
          <div className="flex gap-4">
            <div className="h-10 bg-gray-200 rounded-lg flex-1" />
            <div className="h-10 bg-gray-200 rounded-lg w-32" />
          </div>
        </div>

        {/* Job cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16" />
                <div className="h-6 bg-gray-200 rounded-full w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
