const JobCardSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 animate-pulse"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>

          {/* Job Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-28"></div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-12"></div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default JobCardSkeleton;
