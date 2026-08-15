import Link from 'next/link';
import {
  ADMIN_LIST_TABLE_CLASS,
  LIST_TABLE_CELL_BASE,
  LIST_TABLE_DIVIDER,
} from '@/lib/shared/listTableStyles';
import { formatCurrency, cn } from '@/lib/shared/utils';

/**
 * Bảng sản phẩm trong đơn — kiểu spreadsheet như access log.
 *
 * @param {{ products?: object[] }} props
 */
export default function OrderProductsSheet({ products = [] }) {
  if (!products.length) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-400">
        Đơn hàng chưa có sản phẩm.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={cn(ADMIN_LIST_TABLE_CLASS, 'min-w-[640px]')}>
        <thead>
          <tr className="bg-[#ddd5cc]">
            <th className={cn('w-12 px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-brand-dark', LIST_TABLE_DIVIDER)}>
              STT
            </th>
            <th className={cn('min-w-0 px-2 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-brand-dark', LIST_TABLE_DIVIDER)}>
              Sản phẩm
            </th>
            <th className={cn('w-16 px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-brand-dark', LIST_TABLE_DIVIDER)}>
              SL
            </th>
            <th className={cn('w-[7.5rem] px-2 py-2 text-right text-[11px] font-bold uppercase tracking-wide text-brand-dark', LIST_TABLE_DIVIDER)}>
              Đơn giá
            </th>
            <th className="w-[8rem] px-2 py-2 text-right text-[11px] font-bold uppercase tracking-wide text-brand-dark">
              Thành tiền
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((item, index) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const lineTotal = qty * price;
            const name = item.product_name ?? 'Sản phẩm';
            const productId = item.productId ? String(item.productId) : '';
            const href = productId ? `/products/${productId}` : null;

            return (
              <tr key={`${item.productId ?? item.sku_id ?? index}-${index}`} className="bg-white">
                <td
                  className={cn(
                    LIST_TABLE_CELL_BASE,
                    LIST_TABLE_DIVIDER,
                    'px-2 text-center text-xs tabular-nums text-gray-500',
                  )}
                >
                  {index + 1}
                </td>
                <td className={cn(LIST_TABLE_CELL_BASE, LIST_TABLE_DIVIDER, 'min-w-0 px-2')}>
                  {href ? (
                    <Link
                      href={href}
                      className="block truncate text-sm font-medium text-brand-primary hover:underline"
                      title={name}
                    >
                      {name}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-medium text-brand-dark" title={name}>
                      {name}
                    </p>
                  )}
                  {item.sku_id ? (
                    <p className="mt-0.5 font-mono text-[10px] text-gray-400">
                      SKU: {String(item.sku_id)}
                    </p>
                  ) : null}
                </td>
                <td
                  className={cn(
                    LIST_TABLE_CELL_BASE,
                    LIST_TABLE_DIVIDER,
                    'px-2 text-center text-sm font-medium tabular-nums text-brand-dark',
                  )}
                >
                  {qty}
                </td>
                <td
                  className={cn(
                    LIST_TABLE_CELL_BASE,
                    LIST_TABLE_DIVIDER,
                    'px-2 text-right text-sm font-medium tabular-nums text-brand-dark whitespace-nowrap',
                  )}
                >
                  {formatCurrency(price)}
                </td>
                <td
                  className={cn(
                    LIST_TABLE_CELL_BASE,
                    'px-2 text-right text-sm font-semibold tabular-nums text-brand-dark whitespace-nowrap',
                  )}
                >
                  {formatCurrency(lineTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
