/**
 * Upload API — Cloudinary qua tipjs.
 */

import { apiDelete, apiGet } from '@/lib/api/client';

/**
 * Xóa ảnh Cloudinary nếu không còn product/SKU nào trong shop dùng URL.
 * @param {string} url
 */
export function deleteImageIfUnused(url) {
  return apiDelete('/upload/image', { url });
}

/**
 * Xóa video Cloudinary nếu không còn SKU nào trong shop dùng URL.
 * @param {string} url
 */
export function deleteVideoIfUnused(url) {
  return apiDelete('/upload/video', { url });
}

/**
 * Thư viện ảnh shop — URL unique để tái sử dụng.
 * @param {{ limit?: number }} [opts]
 */
export async function getShopImageLibrary({ limit = 120 } = {}) {
  const raw = await apiGet(`/upload/library?limit=${limit}`, { revalidate: 0 });
  const meta = raw?.metadata ?? raw;
  const items = meta?.items ?? meta?.data ?? meta;
  return Array.isArray(items) ? items : [];
}

/**
 * Thư viện video shop — URL unique để tái sử dụng.
 * @param {{ limit?: number }} [opts]
 */
export async function getShopVideoLibrary({ limit = 60 } = {}) {
  const raw = await apiGet(`/upload/video-library?limit=${limit}`, { revalidate: 0 });
  const meta = raw?.metadata ?? raw;
  const items = meta?.items ?? meta?.data ?? meta;
  return Array.isArray(items) ? items : [];
}
