import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/shared/utils';

/**
 * Class input/select/textarea chuẩn admin.
 * @param {boolean} [hasError]
 */
export function adminControlClass(hasError = false) {
  return cn(
    'min-h-[44px] w-full min-w-0 px-3 text-base text-brand-dark',
    hasError && 'border-red-300 bg-red-50/60 aria-invalid:border-red-400',
  );
}

/**
 * Label + control + error/hint — pattern form thống nhất.
 * @param {{
 *   label: string,
 *   htmlFor?: string,
 *   error?: string,
 *   hint?: string,
 *   required?: boolean,
 *   layout?: 'stack' | 'row',
 *   compact?: boolean,
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export function AdminField({
  label,
  htmlFor,
  error,
  hint,
  required,
  layout = 'stack',
  compact = false,
  children,
  className,
}) {
  const isRow = layout === 'row';
  const hasMeta = Boolean(hint || error);

  if (isRow) {
    return (
      <div
        className={cn(
          'grid min-w-0 grid-cols-[5.25rem_minmax(0,1fr)]',
          compact ? 'gap-x-1.5' : 'gap-x-2',
          hasMeta && (compact ? 'gap-y-0.5' : 'gap-y-1'),
          className,
        )}
      >
        <Label
          htmlFor={htmlFor}
          className="row-start-1 self-center text-xs font-medium leading-snug text-gray-600"
        >
          {label}
          {required && ' *'}
        </Label>
        <div className="row-start-1 min-w-0">{children}</div>
        {hint && !error && (
          <p
            className={cn(
              'col-start-2 row-start-2 text-gray-400',
              compact ? 'text-[11px] leading-tight' : 'text-[11px] leading-snug',
            )}
          >
            {hint}
          </p>
        )}
        {error && (
          <p className={cn('col-start-2 row-start-2 text-red-500', compact ? 'text-[11px]' : 'text-[11px]')}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-w-0',
        compact ? 'space-y-1' : 'space-y-1.5',
        className,
      )}
    >
      <Label
        htmlFor={htmlFor}
        className="text-sm font-medium text-gray-600"
      >
        {label}
        {required && ' *'}
      </Label>
      <div className="w-full">
        {children}
        {hint && !error && (
          <p className={cn('text-gray-400', 'text-sm')}>
            {hint}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Input shadcn + touch target admin.
 * @param {import('react').ComponentProps<typeof Input> & { error?: boolean }} props
 */
export function AdminInput({ className, error, ...props }) {
  return (
    <Input
      aria-invalid={error || undefined}
      className={cn(adminControlClass(Boolean(error)), className)}
      {...props}
    />
  );
}

/**
 * Textarea shadcn + style admin.
 * @param {import('react').ComponentProps<typeof Textarea> & { error?: boolean }} props
 */
export function AdminTextarea({ className, error, ...props }) {
  return (
    <Textarea
      aria-invalid={error || undefined}
      className={cn(
        'min-h-[88px] w-full min-w-0 px-3 py-2 text-base text-brand-dark',
        error && 'border-red-300 bg-red-50/60',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Native select — style đồng bộ AdminInput.
 * @param {import('react').SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }} props
 */
export function AdminSelect({ className, error, ...props }) {
  return (
    <select
      aria-invalid={error || undefined}
      className={cn(
        adminControlClass(Boolean(error)),
        'rounded-lg border border-input bg-white disabled:cursor-not-allowed disabled:bg-brand-gray disabled:text-gray-500',
        className,
      )}
      {...props}
    />
  );
}
