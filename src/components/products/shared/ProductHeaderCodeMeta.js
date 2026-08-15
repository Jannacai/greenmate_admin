import { cn } from '@/lib/shared/utils';

/**
 * Mã sản phẩm inline — dùng trong header trang (giữa tiêu đề và badge trạng thái).
 *
 * @param {{ code?: string | null, className?: string }} props
 */
export default function ProductHeaderCodeMeta({ code, className }) {
  if (!code) return null;

  return (
    <span
      className={cn(
        'inline-flex min-w-0 max-w-[min(100%,18rem)] items-center gap-1',
        className,
      )}
    >
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400 md:text-xs">
        Mã:
      </span>
      <span
        className="truncate font-mono text-[19px] font-semibold leading-none text-brand-dark md:text-[21px]"
        title={code}
      >
        {code}
      </span>
    </span>
  );
}
