import { cn } from '@/lib/shared/utils';

/**
 * Checkbox xuất bản — pattern thống nhất voucher / banner / collection.
 *
 * @param {{
 *   register: import('react-hook-form').UseFormRegister<any>,
 *   name?: string,
 *   isActive: boolean,
 *   isEdit?: boolean,
 *   disabled?: boolean,
 *   activeTitle?: string,
 *   createTitle?: string,
 *   activeHint?: string,
 *   createHint?: string,
 *   editHint?: string,
 *   className?: string,
 * }} props
 */
export function FormPublishToggle({
  register,
  name = 'is_active',
  isActive,
  isEdit = false,
  disabled = false,
  activeTitle = 'Đang bật hiển thị',
  createTitle = 'Xuất bản ngay',
  activeHint = 'Bỏ chọn để ẩn — hoặc dùng nút nhanh ở trang chi tiết',
  createHint = 'Bỏ chọn để lưu nháp, bật sau từ danh sách',
  editHint,
  className,
}) {
  const hint = isEdit ? (editHint ?? activeHint) : createHint;
  const title = isEdit ? activeTitle : createTitle;

  return (
    <label
      className={cn(
        'flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
        isActive ? 'border-brand-primary/40 bg-brand-primary/5' : 'border-gray-200 bg-brand-gray/40',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input
        type="checkbox"
        {...register(name)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/50"
        disabled={disabled}
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-brand-dark">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">{hint}</span>
      </span>
    </label>
  );
}
