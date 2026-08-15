'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/shared/utils';

/** Selector phần tử không kích hoạt điều hướng khi click card. */
const NAV_BLOCK_SELECTOR = 'a, button, input, textarea, select, [data-card-nav-block]';

/**
 * Bọc card danh sách — click vùng trống / nền / tên SP (Link) → chi tiết;
 * nút Copy mã, thao tác… có `data-card-nav-block` hoặc là `a`/`button` riêng.
 *
 * @param {{
 *   href: string,
 *   children: React.ReactNode,
 *   className?: string,
 *   as?: 'article' | 'tr',
 *   'data-product-status'?: string,
 * }} props
 */
export default function ProductListCardNav({
  href,
  children,
  className,
  as: Component = 'article',
  ...props
}) {
  const isTableRow = Component === 'tr';
  const router = useRouter();

  function shouldNavigate(event) {
    if (event.defaultPrevented) return false;
    if (event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    const target = event.target;
    if (!(target instanceof Element)) return false;
    return !target.closest(NAV_BLOCK_SELECTOR);
  }

  function handleClick(event) {
    if (!shouldNavigate(event)) return;
    router.push(href);
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target;
    if (target instanceof Element && target.closest(NAV_BLOCK_SELECTOR)) return;
    event.preventDefault();
    router.push(href);
  }

  return (
    <Component
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'cursor-pointer outline-none group/card',
        isTableRow
          ? 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary/50'
          : 'focus-visible:ring-2 focus-visible:ring-brand-primary/50',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
