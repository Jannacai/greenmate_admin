'use client';

import Link from 'next/link';
import ProductListCardNav from '@/components/products/list/ProductListCardNav';
import CollectionStatusBadge from '@/components/collections/CollectionStatusBadge';
import CollectionRowActions from '@/components/collections/CollectionRowActions';
import CollectionSummaryCard from '@/components/collections/CollectionSummaryCard';
import {
  getCollectionProductCount,
  getCollectionStatusKey,
  getCollectionStorefrontPath,
} from '@/lib/collections/collectionDisplay';
import { cn } from '@/lib/shared/utils';
import {
  COLLECTION_TABLE_CELL_BASE,
  COLLECTION_TABLE_COL,
  COLLECTION_TABLE_DIVIDER,
} from '@/components/collections/collectionListTableStyles';
import {
  ADMIN_LIST_ROW_HOVER_CLASS,
  getAdminListRowZebraClass,
} from '@/lib/shared/listTableStyles';

const LIFECYCLE_ROW_ACCENT = {
  active: 'shadow-[inset_3px_0_0_0_#4ade80]',
  inactive: 'shadow-[inset_3px_0_0_0_#d1d5db]',
};

/**
 * Card / hàng bộ sưu tập — mobile: summary card; desktop (row): `<tr>` trong bảng.
 *
 * @param {{
 *   collection: object,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   desktopVariant?: 'card' | 'row',
 *   rowIndex?: number,
 * }} props
 */
export function CollectionListCard({
  collection,
  canUpdate = false,
  canDelete = false,
  desktopVariant = 'card',
  rowIndex = 0,
}) {
  const id = String(collection._id);
  const detailHref = `/collections/${id}`;
  const lifecycle = getCollectionStatusKey(collection);
  const productCount = getCollectionProductCount(collection);
  const storefrontPath = collection.storefront_path ?? getCollectionStorefrontPath(collection);

  if (desktopVariant === 'row') {
    return (
      <ProductListCardNav
        as="tr"
        href={detailHref}
        data-collection-lifecycle={lifecycle}
        className={cn(
          getAdminListRowZebraClass(rowIndex),
          ADMIN_LIST_ROW_HOVER_CLASS,
          LIFECYCLE_ROW_ACCENT[lifecycle] ?? LIFECYCLE_ROW_ACCENT.inactive,
        )}
      >
        <td className={cn(COLLECTION_TABLE_CELL_BASE, COLLECTION_TABLE_COL.name)}>
          <Link
            href={detailHref}
            data-card-nav-block
            title={collection.collection_name}
            className="block truncate text-xs font-semibold text-brand-dark hover:text-brand-primary hover:underline"
          >
            {collection.collection_name}
          </Link>
        </td>
        <td className={cn(COLLECTION_TABLE_CELL_BASE, COLLECTION_TABLE_COL.products, COLLECTION_TABLE_DIVIDER, 'text-center')}>
          <span className="text-xs font-semibold tabular-nums text-brand-dark whitespace-nowrap">
            {productCount}
          </span>
        </td>
        <td className={cn(COLLECTION_TABLE_CELL_BASE, COLLECTION_TABLE_COL.pill, COLLECTION_TABLE_DIVIDER, 'text-center')}>
          <CollectionStatusBadge
            collection={collection}
            plain
            className="justify-center whitespace-nowrap"
          />
        </td>
        <td className={cn(COLLECTION_TABLE_CELL_BASE, COLLECTION_TABLE_COL.url, COLLECTION_TABLE_DIVIDER)}>
          <span
            className="block truncate font-mono text-[10px] font-medium text-gray-600 md:text-xs"
            title={storefrontPath || undefined}
          >
            {storefrontPath || '—'}
          </span>
        </td>
        <td className={cn(COLLECTION_TABLE_CELL_BASE, COLLECTION_TABLE_COL.actions, COLLECTION_TABLE_DIVIDER, 'text-right')}>
          <CollectionRowActions
            collectionId={id}
            collection={collection}
            canUpdate={canUpdate}
            canDelete={canDelete}
            layout="row"
            hideDetailLink
            compact
          />
        </td>
      </ProductListCardNav>
    );
  }

  return (
    <CollectionSummaryCard
      collection={collection}
      href={detailHref}
      showActions
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  );
}
