import Link from 'next/link';
import { AdminButton } from '@/components/admin/AdminButton';
import { cn } from '@/lib/shared/utils';

/** Header trang list/detail — title + (middle) + action bên phải. */
export function PageHeader({ title, description, middle, action, className }) {
  return (
    <div className={cn('mb-[10px] flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between', className)}>
      <div className="shrink-0">
        <h1 className="text-xl font-bold text-orange-600">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-gray-400">{description}</p>
        )}
      </div>
      {middle ? (
        <div className="min-w-0 flex-1 lg:px-4">{middle}</div>
      ) : null}
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Nút action chính trên PageHeader (link hoặc button). */
export function PageHeaderAction({ href, children, icon, className, ...props }) {
  const content = (
    <>
      {icon}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0">
        <AdminButton className={cn('gap-2', className)} {...props}>
          {content}
        </AdminButton>
      </Link>
    );
  }

  return (
    <AdminButton className={cn('gap-2', className)} {...props}>
      {content}
    </AdminButton>
  );
}
