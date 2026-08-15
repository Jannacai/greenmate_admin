export default function CategoriesLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-3 animate-pulse">
      <div className="h-8 w-44 rounded-lg bg-gray-200" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-gray-100" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-gray-200" />
    </div>
  );
}
