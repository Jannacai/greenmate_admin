export default function InventoryLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-3 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-gray-200" />
      <div className="h-16 rounded-lg bg-gray-100" />
      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 rounded-md bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
