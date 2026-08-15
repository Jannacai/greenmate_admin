import Link from 'next/link';
import ListPagination from '@/components/common/ListPagination';
import { BannerListCard } from '@/components/banners/BannerListCard';
import {
  BANNER_LIST_TABLE_CLASS,
  BANNER_TABLE_COL,
  BANNER_TABLE_DIVIDER,
  BANNER_TABLE_HEAD_BASE,
} from '@/components/banners/bannerListTableStyles';
import { cn } from '@/lib/shared/utils';
import { DEFAULT_LIST_LIMIT } from '@/lib/shared/listPagination';

/**
 * @param {{
 *   banners: Array<object>,
 *   total?: number,
 *   page?: number,
 *   limit?: number,
 *   canCreate?: boolean,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   querySuffix?: string,
 * }} props
 */
export default function BannerListTable({
  banners = [],
  total = 0,
  page = 1,
  limit = DEFAULT_LIST_LIMIT,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  querySuffix = '',
}) {
  if (!banners.length) {
    return (
      <div className="overflow-hidden rounded-lg border border-dashed border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <h2 className="mt-3 text-sm font-semibold text-brand-dark">Chưa có banner</h2>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            Tạo slide hero hoặc banner strip danh mục — mỗi banner gồm ảnh desktop, mobile và link đích.
          </p>
          {canCreate && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/banners/hero/new"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-brand-primary bg-brand-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-primary/90 transition-colors"
              >
                Tạo slide hero
              </Link>
              <Link
                href="/banners/category/new"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-brand-primary bg-white px-3 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-primary/5 transition-colors"
              >
                Tạo banner danh mục
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:hidden">
        {banners.map((banner, index) => (
          <BannerListCard
            key={banner._id}
            banner={banner}
            canUpdate={canUpdate}
            canDelete={canDelete}
            rowIndex={index}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className={BANNER_LIST_TABLE_CLASS}>
            <thead>
              <tr>
                <th className={cn(BANNER_TABLE_HEAD_BASE, BANNER_TABLE_COL.slide, 'text-center')}>
                  Slide
                </th>
                <th className={cn(BANNER_TABLE_HEAD_BASE, BANNER_TABLE_COL.sort, BANNER_TABLE_DIVIDER, 'text-center')}>
                  TT
                </th>
                <th className={cn(BANNER_TABLE_HEAD_BASE, BANNER_TABLE_COL.link, BANNER_TABLE_DIVIDER, 'text-center')}>
                  Link
                </th>
                <th className={cn(BANNER_TABLE_HEAD_BASE, BANNER_TABLE_COL.pill, BANNER_TABLE_DIVIDER, 'text-center')}>
                  Trạng thái
                </th>
                <th className={cn(BANNER_TABLE_HEAD_BASE, BANNER_TABLE_COL.actions, BANNER_TABLE_DIVIDER, 'text-center')}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner, index) => (
                <BannerListCard
                  key={banner._id}
                  banner={banner}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  desktopVariant="row"
                  rowIndex={index}
                />
              ))}
            </tbody>
          </table>
        </div>

        <ListPagination
          page={page}
          limit={limit}
          total={total}
          querySuffix={querySuffix}
          itemLabel="slide"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white md:hidden">
        <ListPagination
          page={page}
          limit={limit}
          total={total}
          querySuffix={querySuffix}
          itemLabel="slide"
        />
      </div>
    </div>
  );
}
