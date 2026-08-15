import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/shared/utils';

/**
 * Card form chuẩn admin — dùng shadcn Card + header thống nhất.
 * @param {{ title: string, badge?: string, hint?: string, required?: boolean, compact?: boolean, actions?: React.ReactNode, children: React.ReactNode, className?: string }} props
 */
export function FormCard({ title, badge, hint, required, compact, actions, children, className }) {
  return (
    <Card size={compact ? 'sm' : 'default'} className={cn('min-w-0 shadow-sm ring-gray-200', className)}>
      <CardHeader className={cn('gap-1', compact ? 'pb-1' : 'pb-3')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold text-brand-dark">
              {title}
              {required && <span className="text-brand-primary">*</span>}
              {badge && (
                <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-medium text-gray-500">
                  {badge}
                </Badge>
              )}
            </CardTitle>
            {hint ? (
              typeof hint === 'string' ? (
                <p className="text-sm text-gray-400">{hint}</p>
              ) : (
                <div className="text-sm">{hint}</div>
              )
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {actions}
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className={cn('pt-0', compact ? 'space-y-2.5' : 'space-y-4')}>{children}</CardContent>
    </Card>
  );
}

/**
 * Card collapsible — style đồng bộ FormCard.
 * @param {{ title: string, subtitle?: string, children: React.ReactNode, className?: string }} props
 */
export function FormCollapsibleCard({ title, subtitle, children, className }) {
  return (
    <details className={cn('group min-w-0 overflow-hidden rounded-xl bg-card ring-1 ring-gray-200 shadow-sm', className)}>
      <summary className="cursor-pointer list-none px-4 py-3.5 md:px-5 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-brand-dark">{title}</p>
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
          </div>
          <svg
            className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </summary>
      <div className="border-t border-gray-100 px-4 pb-4 pt-4 md:px-5 md:pb-5">{children}</div>
    </details>
  );
}
