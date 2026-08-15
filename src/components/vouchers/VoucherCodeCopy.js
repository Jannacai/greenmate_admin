'use client';

import { useState } from 'react';
import { cn } from '@/lib/shared/utils';

/**
 * Mã voucher + copy — nhấn để copy, không hiện chữ "Copy".
 *
 * @param {{
 *   code: string,
 *   size?: 'sm' | 'md' | 'lg' | 'xl',
 *   variant?: 'block' | 'inline',
 *   plain?: boolean,
 *   className?: string,
 *   showLabel?: boolean,
 *   label?: string,
 *   labelAlign?: 'left' | 'right',
 * }} props
 */
export default function VoucherCodeCopy({
  code,
  size = 'sm',
  variant = 'block',
  plain = false,
  className,
  showLabel = true,
  label = 'Mã voucher',
  labelAlign = 'left',
}) {
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const isInline = variant === 'inline';

  const pillClass = {
    sm: 'rounded-md px-2 py-0.5',
    md: 'rounded-lg px-2.5 py-1',
    lg: 'rounded-lg px-3 py-1.5',
    xl: 'rounded-xl px-4 py-2',
  }[size];

  const codeClass = {
    sm: 'text-xs font-bold leading-none text-brand-primary md:text-sm',
    md: 'text-sm font-bold leading-none text-brand-primary md:text-base',
    lg: 'text-base font-bold leading-none text-brand-primary md:text-lg',
    xl: 'text-lg font-bold leading-none text-brand-primary md:text-xl',
  }[size];

  const labelClass = {
    sm: 'mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400',
    md: 'mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 md:text-xs',
    lg: 'mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 md:text-xs',
    xl: 'mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500',
  }[size];

  const checkIconClass = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-4 w-4',
    xl: 'h-5 w-5',
  }[size];

  return (
    <div className={cn('min-w-0', isInline && 'w-fit max-w-full', className)}>
      {showLabel && (
        <p className={cn(labelClass, labelAlign === 'right' && 'text-right')}>{label}</p>
      )}
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? 'Đã copy mã voucher' : `Nhấn để copy ${label.toLowerCase()}`}
        aria-label={copied ? 'Đã copy mã voucher' : `Copy mã ${code}`}
        className={cn(
          'inline-flex max-w-full items-center gap-1.5 cursor-copy font-mono uppercase tracking-wider',
          isInline ? 'w-fit' : 'w-full',
          plain
            ? cn(
              'border-0 bg-transparent p-0 shadow-none',
              'hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 rounded-sm',
            )
            : cn(
              'border border-brand-primary/25 bg-brand-primary/5',
              'shadow-sm transition-[colors,box-shadow] duration-150 hover:border-brand-primary/45 hover:bg-brand-primary/10',
              copied && 'border-brand-primary/60 bg-brand-primary/10 ring-1 ring-brand-primary/25',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary/40',
              pillClass,
            ),
        )}
      >
        <span className={cn(isInline ? 'whitespace-nowrap' : 'min-w-0 truncate', codeClass)}>{code}</span>
        {copied && (
          <span className="shrink-0 text-brand-primary" aria-hidden>
            <svg
              className={checkIconClass}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
        )}
        <span className="sr-only" aria-live="polite">
          {copied ? 'Đã copy mã voucher' : ''}
        </span>
      </button>
    </div>
  );
}
