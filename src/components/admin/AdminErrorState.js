/**
 * Khối lỗi fetch dữ liệu — dùng thống nhất trên trang list.
 * @param {{ title?: string, message?: string, hint?: React.ReactNode }} props
 */
export function AdminErrorState({
  title = 'Không tải được dữ liệu',
  message,
  hint,
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p className="font-medium">{title}</p>
      {message && <p className="mt-1 text-xs text-red-600">{message}</p>}
      {hint && <p className="mt-2 text-xs text-red-500">{hint}</p>}
    </div>
  );
}
