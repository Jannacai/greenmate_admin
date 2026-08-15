'use client';

import Link from 'next/link';
import CollectionStatusBadge from '@/components/collections/CollectionStatusBadge';
import CollectionRowActions from '@/components/collections/CollectionRowActions';
import {
  getCollectionProductCount,
  getCollectionStatusKey,
  getCollectionStorefrontPath,
} from '@/lib/collections/collectionDisplay';
import { getVoucherCardTheme } from '@/lib/vouchers/voucherLifecycleUi';
import { cn } from '@/lib/shared/utils';

/**
 * Card tóm tắt bộ sưu tập — mobile list, pattern VoucherSummaryCard (dense).
 *
 * @param {{
 *   collection: object,
 *   href?: string,
 *   showActions?: boolean,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   className?: string,
 * }} props
 */
export default function CollectionSummaryCard({
  collection,
  href,
  showActions = false,
  canUpdate = false,
  canDelete = false,
  className,
}) {
  const id = String(collection._id);
  const detailHref = href ?? `/collections/${id}`;
  const lifecycle = getCollectionStatusKey(collection);
  const cardTheme = getVoucherCardTheme(lifecycle);
  const productCount = getCollectionProductCount(collection);
  const storefrontPath = collection.storefront_path ?? getCollectionStorefrontPath(collection);

  return (
    <article
      data-collection-lifecycle={lifecycle}
      className={cn(
        'relative overflow-hidden rounded-xl border shadow-sm',
        cardTheme.border,
        cardTheme.bg,
        detailHref && 'cursor-pointer transition-shadow hover:shadow-md',
        detailHref && cardTheme.hoverBorder,
        className,
      )}
    >
      {detailHref && (
        <Link
          href={detailHref}
          className="absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
          aria-label={`Xem chi tiết bộ sưu tập ${collection.collection_name}`}
        />
      )}

      <div className={cn('relative z-[1]', detailHref && 'pointer-events-none')}>
        <div className={cn('py-2', cardTheme.header)}>
          <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-[minmax(0,1fr)_auto_auto] md:divide-x md:divide-y-0 md:items-stretch">
            <div className="min-w-0 px-3 py-2">
              <CollectionStatusBadge collection={collection} dense />
              <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-tight text-brand-dark">
                {collection.collection_name}
              </h2>
              <p className="mt-0.5 truncate font-mono text-xs text-gray-500">
                {collection.collection_slug}
              </p>
            </div>

            <div className="flex flex-col justify-center px-3 py-2 text-center md:min-w-[4.5rem]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">SP</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-brand-dark">{productCount}</p>
            </div>

            <div
              className={cn(
                'flex flex-col justify-center px-3 py-2 md:items-end md:text-right',
                detailHref && 'pointer-events-auto',
              )}
            >
              {showActions && (canUpdate || canDelete) && (
                <CollectionRowActions
                  collectionId={id}
                  collection={collection}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  layout="row"
                  hideDetailLink
                  compact
                />
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200" />

        <div className="px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">URL storefront</p>
          <p className="mt-0.5 truncate font-mono text-xs text-brand-primary">
            {storefrontPath || '—'}
          </p>
        </div>
      </div>
    </article>
  );
}
