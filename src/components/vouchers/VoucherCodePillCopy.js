'use client';

import { useState } from 'react';
import { cn } from '@/lib/shared/utils';

/**
 * Pill mã voucher nhỏ — click để copy (dùng trong list giá SP).
 *
 * @param {{
 *   code: string,
 *   name?: string | null,
 *   className?: string,
 * }} props
 */
export default function VoucherCodePillCopy({ code, name = null, className }) {
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  async function handleCopy(event) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const title = copied
    ? 'Đã copy mã voucher'
    : `Nhấn để copy mã voucher${name ? ` — ${name}` : ''}`;

  return (
    <button
      type="button"
      data-card-nav-block
      onClick={handleCopy}
      title={title}
      aria-label={copied ? 'Đã copy mã voucher' : `Copy mã voucher ${code}`}
      className={cn(
        'min-w-0 truncate rounded-full bg-brand-primary/10 px-1.5 py-px',
        'text-[9px] font-semibold text-brand-primary ring-1 ring-brand-primary/20',
        'transition-[background-color,box-shadow] hover:bg-brand-primary/15 hover:ring-brand-primary/35',
        'focus:outline-none focus:ring-2 focus:ring-brand-primary/40',
        'md:text-[10px]',
        copied && 'ring-brand-primary/45 bg-brand-primary/15',
        className,
      )}
    >
      {copied ? '✓' : code}
    </button>
  );
}
