'use client';

import { useState } from 'react';
import { cn } from '@/lib/shared/utils';

/**
 * Mã sản phẩm (product_code) + copy.
 * `plain` — chữ thuần, không pill / không chữ "Copy" (chuẩn list densify).
 *
 * @param {{
 *   id: string,
 *   size?: 'xs' | 'sm' | 'md' | 'list' | 'picker',
 *   variant?: 'default' | 'compact',
 *   plain?: boolean,
 *   className?: string,
 *   showLabel?: boolean,
 *   label?: string,
 * }} props
 */
export default function ProductIdCopy({
  id,
  size = 'sm',
  variant = 'default',
  plain = false,
  className,
  showLabel = true,
  label = 'Mã sản phẩm',
}) {
  const [copied, setCopied] = useState(false);

  if (!id) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const pillClass = {
    xs: 'gap-1 rounded-md px-1.5 py-0.5 text-[10px]',
    picker: 'gap-1.5 rounded-md px-2 py-1 text-[15px] leading-snug font-semibold',
    list: 'gap-1.5 rounded-md px-2 py-0.5 text-sm leading-tight font-bold',
    sm: 'gap-2 rounded-lg px-2.5 py-1.5 text-xs md:text-sm',
    md: 'gap-2 rounded-lg px-3 py-2 text-sm md:text-base',
  }[size];

  const labelClass = {
    xs: 'mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-400',
    picker: 'mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500',
    list: 'mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500',
    sm: 'mb-1.5 text-xs font-semibold text-gray-600',
    md: 'mb-2 text-sm font-semibold text-gray-600',
  }[size];

  const copyHintClass = {
    xs: 'text-[9px]',
    picker: 'text-[12px]',
    list: 'text-[11px]',
    sm: 'text-[11px] md:text-xs',
    md: 'text-xs',
  }[size];

  const isCompact = variant === 'compact' || size === 'xs' || size === 'list' || size === 'picker';

  if (plain) {
    return (
      <div className={cn('min-w-0', className)}>
        {showLabel && <p className={labelClass}>{label}</p>}
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? 'Đã copy' : `Nhấn để copy ${label.toLowerCase()}`}
          aria-label={copied ? 'Đã copy' : `Copy mã ${id}`}
          className={cn(
            'inline-flex max-w-full items-center gap-1 cursor-copy border-0 bg-transparent p-0 font-mono text-sm font-bold uppercase tracking-wider text-brand-primary',
            'hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 rounded-sm',
          )}
        >
          <span className="min-w-0 truncate">{id}</span>
          {copied && (
            <span className="shrink-0 text-brand-primary" aria-hidden>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
          )}
          <span className="sr-only" aria-live="polite">
            {copied ? 'Đã copy' : ''}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={cn('min-w-0', className)}>
      {showLabel && (
        <p className={labelClass}>{label}</p>
      )}
      <button
        type="button"
        onClick={handleCopy}
        title={`Nhấn để copy ${label.toLowerCase()}`}
        className={cn(
          'group inline-flex max-w-full items-center font-mono transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand-primary/50',
          isCompact
            ? cn(
              'border border-gray-200 bg-white text-brand-dark hover:border-brand-primary/40 hover:bg-brand-primary/5',
              size === 'xs' || size === 'picker' ? 'w-full' : size === 'list' ? 'w-fit max-w-full' : '',
            )
            : cn(
              'w-full border border-brand-primary/25 bg-brand-primary/5 font-bold text-brand-primary',
              'hover:border-brand-primary/45 hover:bg-brand-primary/10',
            ),
          pillClass,
        )}
      >
        <span className="min-w-0 flex-1 truncate tracking-tight">{id}</span>
        <span
          className={cn(
            'shrink-0 font-semibold normal-case tracking-normal text-gray-400 group-hover:text-brand-primary',
            copyHintClass,
          )}
        >
          {copied ? '✓' : 'Copy'}
        </span>
      </button>
    </div>
  );
}
