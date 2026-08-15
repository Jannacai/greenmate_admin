export default function LoginLoading() {
  return (
    <div className="min-h-screen flex">
      {/* Brand panel skeleton */}
      <div className="hidden lg:block lg:w-1/2 bg-[#6B4E3D]" />

      {/* Form skeleton */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm space-y-5 animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-56 bg-gray-100 rounded" />
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-100 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-100 rounded-lg" />
            </div>
            <div className="h-10 w-full bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
