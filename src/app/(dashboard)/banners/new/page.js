import { redirect } from 'next/navigation';

/**
 * Giữ URL cũ — chuyển sang form hero slider riêng.
 * @param {{ searchParams: Promise<Record<string, string | undefined>> }} props
 */
export default async function BannerNewRedirectPage({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.placement) qs.set('placement', params.placement);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  redirect(`/banners/hero/new${suffix}`);
}
