'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { createPortal } from 'react-dom';
import { getProductPriceDetailAction } from '@/lib/actions/product';
import { buildProductPriceDetail } from '@/lib/products/productPriceDetail';
import { getProductListMeta } from '@/lib/products/productDisplay';
import { cn, formatCurrency } from '@/lib/shared/utils';

const OPEN_DELAY_MS = 280;
const CLOSE_DELAY_MS = 180;
const PANEL_WIDTH = 560;
const PANEL_MIN_HEIGHT = 100;

/**
 * Popover giá SKU + voucher khi hover tên / ảnh SP.
 *
 * @param {{
 *   product: object,
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function ProductPriceHoverCard({
  product,
  children,
  className,
}) {
  const anchorRef = useRef(null);
  const panelRef = useRef(null);
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const fetchedIdRef = useRef('');

  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [detail, setDetail] = useState(null);
  const [isPending, startTransition] = useTransition();

  const listMeta = useMemo(() => getProductListMeta(product), [product]);

  const clearTimers = useCallback(() => {
    clearTimeout(openTimerRef.current);
    clearTimeout(closeTimerRef.current);
  }, []);

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    const panel = panelRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const panelWidth = Math.min(PANEL_WIDTH, window.innerWidth - 24);
    const panelHeight = panel?.offsetHeight || PANEL_MIN_HEIGHT;
    const gap = 10;

    let left = rect.left;
    let top = rect.bottom + gap;

    if (left + panelWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - panelWidth - 12);
    }
    if (left < 12) left = 12;

    if (top + panelHeight > window.innerHeight - 12) {
      top = rect.top - panelHeight - gap;
    }
    if (top < 12) top = 12;

    setCoords({ top, left });
  }, []);

  const loadDetail = useCallback(() => {
    const id = listMeta.id;
    if (!id || fetchedIdRef.current === id) return;

    startTransition(async () => {
      const res = await getProductPriceDetailAction(id);
      if (res?.product) {
        setDetail(buildProductPriceDetail({
          ...res.product,
          active_voucher: res.product.active_voucher ?? product.active_voucher,
          has_voucher_discount: res.product.has_voucher_discount ?? product.has_voucher_discount,
          product_price_pre_voucher_min: res.product.product_price_pre_voucher_min ?? product.product_price_pre_voucher_min,
          product_price_min: res.product.product_price_min ?? product.product_price_min,
          product_price_base_min: res.product.product_price_base_min ?? product.product_price_base_min,
        }));
        fetchedIdRef.current = id;
      }
    });
  }, [listMeta.id, product]);

  const scheduleOpen = useCallback(() => {
    clearTimers();
    openTimerRef.current = setTimeout(() => {
      const el = anchorRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const panelWidth = Math.min(PANEL_WIDTH, window.innerWidth - 24);
        let left = rect.left;
        if (left + panelWidth > window.innerWidth - 12) {
          left = Math.max(12, window.innerWidth - panelWidth - 12);
        }
        setCoords({ top: rect.bottom + 10, left: Math.max(12, left) });
      }
      setOpen(true);
      loadDetail();
    }, OPEN_DELAY_MS);
  }, [clearTimers, loadDetail]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }, [clearTimers]);

  const cancelClose = useCallback(() => {
    clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const raf = requestAnimationFrame(() => updatePosition());
    function onScrollOrResize() {
      updatePosition();
    }
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updatePosition, detail, isPending]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const display = detail ?? buildProductPriceDetail(product);

  return (
    <>
      <div
        ref={anchorRef}
        className={cn('w-fit max-w-full', className)}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        onFocus={scheduleOpen}
        onBlur={scheduleClose}
      >
        {children}
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label={`Giá SKU — ${display.productName}`}
          className="fixed z-[200] w-[min(560px,calc(100vw-24px))] select-text overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
          style={{ top: coords.top, left: coords.left }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-[#f7f4f1] px-2.5 py-1.5">
            <p className="min-w-0 truncate text-[13px] font-bold text-brand-dark">
              {display.productName}
            </p>
            {display.hasVoucher && display.voucher ? (
              <p className="shrink-0 whitespace-nowrap text-[12px]">
                <span className="font-mono font-bold text-brand-primary">{display.voucher.code}</span>
                {display.voucher.discountPercent > 0 && (
                  <span className="ml-1 font-bold text-orange-600">
                    −{display.voucher.discountPercent}%
                  </span>
                )}
              </p>
            ) : (
              <span className="shrink-0 text-[11px] font-medium text-gray-400">
                Không voucher
              </span>
            )}
          </div>

          <div className="max-h-[min(42vh,320px)] overflow-auto">
            {display.skuRows.length > 0 ? (
              <table className="w-full min-w-[480px] border-collapse text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#ddd5cc] text-[11px] font-bold uppercase tracking-wide text-brand-dark">
                    <th className="px-2.5 py-1.5 text-left font-bold">Biến thể</th>
                    <th className="w-24 px-2 py-1.5 text-right font-bold">Giá gốc</th>
                    <th className="w-24 px-2 py-1.5 text-right font-bold">Sau giảm</th>
                    <th className="w-14 px-2 py-1.5 text-center font-bold">Giảm</th>
                  </tr>
                </thead>
                <tbody>
                  {display.skuRows.map((row, index) => (
                    <SkuPriceRow key={row.id || row.skuCode} row={row} index={index} />
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-3 py-4 text-center text-xs text-gray-500">
                {isPending ? 'Đang tải…' : 'Chưa có SKU.'}
              </p>
            )}
          </div>

          {isPending && display.skuRows.length > 0 && (
            <div className="border-t border-gray-100 px-2.5 py-1 text-center text-[10px] text-gray-400">
              Đang cập nhật…
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}

/**
 * @param {{ row: object, index: number }} props
 */
function SkuPriceRow({ row, index }) {
  const [copied, setCopied] = useState(false);
  const hasDiscount = row.discountPercent > 0;
  const zebra = index % 2 === 1;

  async function handleCopySku() {
    if (!row.skuCode || row.skuCode === '—') return;
    try {
      await navigator.clipboard.writeText(row.skuCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <tr
      className={cn(
        'border-b border-gray-100 transition-colors',
        zebra ? 'bg-gray-50' : 'bg-white',
        'hover:bg-orange-50/50',
      )}
    >
      <td className="min-w-0 px-2.5 py-1.5 align-middle">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span className="shrink-0 text-[13px] font-bold leading-tight text-brand-dark">
            {row.label}
          </span>
          {row.skuCode && (
            <button
              type="button"
              onClick={handleCopySku}
              title={copied ? 'Đã copy' : 'Copy mã SKU'}
              className={cn(
                'min-w-0 truncate font-mono text-[11px] font-semibold leading-tight text-brand-primary',
                'hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary/40',
              )}
            >
              {copied ? 'Đã copy' : row.skuCode}
            </button>
          )}
        </div>
      </td>
      <td className="px-2 py-1.5 text-right align-middle tabular-nums whitespace-nowrap">
        <span
          className={cn(
            'text-[12px] leading-none',
            hasDiscount ? 'text-gray-400 line-through' : 'font-semibold text-brand-dark',
          )}
        >
          {formatCurrency(row.basePrice)}
        </span>
      </td>
      <td className="px-2 py-1.5 text-right align-middle tabular-nums whitespace-nowrap">
        <span
          className={cn(
            'text-[13px] font-bold leading-none',
            hasDiscount ? 'text-orange-600' : 'text-brand-dark',
          )}
        >
          {formatCurrency(row.finalPrice)}
        </span>
      </td>
      <td className="px-2 py-1.5 text-center align-middle tabular-nums whitespace-nowrap">
        {hasDiscount ? (
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full bg-brand-primary px-1.5 py-0.5',
              'text-[10px] font-bold leading-none text-white',
            )}
          >
            −{row.discountPercent}%
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>
    </tr>
  );
}
