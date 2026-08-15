'use server';

import { cookies } from 'next/headers';
import { getCanonicalStorageUrl } from '@/lib/shared/image';
import { deleteImageIfUnused, deleteVideoIfUnused, getShopImageLibrary, getShopVideoLibrary } from '@/lib/api/upload';
import { requireAnyPermission, requirePermission } from '@/lib/auth/assertPermission';
import { forwardVideoUpload } from '@/lib/upload/videoUpload.server';

import { getServerEnv } from '@/lib/shared/env';
import { mutationErrorMessage, uploadErrorMessage } from '@/lib/shared/actionError';

const { apiUrl: BASE_URL, apiKey: API_KEY } = getServerEnv();

const UPLOAD_IMAGE_RESOURCES = ['product', 'banner', 'category'];
const READ_MEDIA_LIBRARY_RESOURCES = ['product', 'banner', 'category'];
const MAX_SIZE      = 5 * 1024 * 1024; // 5MB

/** @param {number} status */
function mapUploadError(status, message) {
  if (status === 404) {
    return 'API upload chưa sẵn sàng (404). Hãy restart server tipjs (npm start) rồi thử lại.';
  }
  if (status === 403) return message || 'Thiếu hoặc sai API key';
  if (status === 405) return 'Phiên đăng nhập hết hạn. Vui lòng đăng xuất và đăng nhập lại.';
  if (message?.includes('keyStore')) return 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.';
  return message || 'Upload thất bại, vui lòng thử lại';
}

/**
 * Upload ảnh lên server → Cloudinary.
 * Endpoint: POST /api/v1/upload/file
 *
 * Trả về URL canonical (lưu MongoDB) + biến thể tối ưu từ server.
 *
 * @param {FormData} formData  — field "file": File
 * @returns {{ url?: string, publicId?: string, urls?: object, error?: string }}
 */
export async function uploadImageAction(formData) {
  const denied = await requireAnyPermission('update:any', UPLOAD_IMAGE_RESOURCES);
  if (denied) return denied;

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const file = formData.get('file');

  if (!file || typeof file === 'string') return { error: 'Không có file' };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: 'Chỉ chấp nhận JPG, PNG, WebP' };
  if (file.size > MAX_SIZE) return { error: 'Ảnh tối đa 5MB' };

  const cookieStore = await cookies();
  const token    = cookieStore.get('admin_token')?.value;
  const clientId = cookieStore.get('admin_client_id')?.value;

  if (!token || !clientId) {
    return { error: 'Chưa đăng nhập. Vui lòng đăng nhập lại.' };
  }

  if (!API_KEY) {
    return { error: 'Thiếu API_KEY trong .env.local của admin' };
  }

  const uploadBody = new FormData();
  uploadBody.append('file', file, file.name);

  try {
    const res = await fetch(`${BASE_URL}/upload/file`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        authorization: token,
        'x-client-id': clientId,
      },
      body: uploadBody,
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { error: mapUploadError(res.status, data.message) };
    }

    const meta = data.metadata ?? {};
    const rawUrl = meta.url ?? meta.data?.url;

    if (typeof rawUrl !== 'string' || !rawUrl.startsWith('http')) {
      return { error: 'Server không trả về URL Cloudinary hợp lệ' };
    }

    /** URL gốc không transform — dùng lưu product_thumb / sku_images */
    const url = getCanonicalStorageUrl(rawUrl);

    return {
      url,
      publicId: meta.public_id,
      urls: meta.urls ?? null,
    };
  } catch (err) {
    return { error: uploadErrorMessage(err, 'Upload thất bại, vui lòng thử lại') };
  }
}

/**
 * Upload video SKU — ưu tiên POST /api/upload/video từ client (file lớn).
 *
 * @param {FormData} formData — field "file": File
 * @returns {{ url?: string, publicId?: string, duration?: number|null, error?: string }}
 */
export async function uploadVideoAction(formData) {
  const denied = await requirePermission('update:any', 'product');
  if (denied) return denied;

  const file = formData.get('file');
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const clientId = cookieStore.get('admin_client_id')?.value;

  if (!token || !clientId) {
    return { error: 'Chưa đăng nhập. Vui lòng đăng nhập lại.' };
  }

  return forwardVideoUpload({ file, token, clientId });
}

/**
 * Xóa các URL không còn được product/SKU nào tham chiếu (chạy sau khi lưu SP).
 * Không throw — cleanup best-effort, không chặn luồng chính.
 *
 * @param {string[]} urls
 * @returns {Promise<{ cleaned: number, skipped: number }>}
 */
export async function cleanupOrphanImagesAction(urls) {
  if (!urls?.length) return { cleaned: 0, skipped: 0 };

  const denied = await requirePermission('update:any', 'product');
  if (denied) return { cleaned: 0, skipped: urls.length };

  let cleaned = 0;
  let skipped = 0;

  for (const url of urls) {
    try {
      const res = await deleteImageIfUnused(url);
      const meta = res?.metadata ?? res;
      if (meta?.deleted) cleaned += 1;
      else skipped += 1;
    } catch {
      skipped += 1;
    }
  }

  return { cleaned, skipped };
}

/**
 * Xóa các URL video không còn được SKU nào tham chiếu (chạy sau khi lưu SP).
 * @param {string[]} urls
 * @returns {Promise<{ cleaned: number, skipped: number }>}
 */
export async function cleanupOrphanVideosAction(urls) {
  if (!urls?.length) return { cleaned: 0, skipped: 0 };

  const denied = await requirePermission('update:any', 'product');
  if (denied) return { cleaned: 0, skipped: urls.length };

  let cleaned = 0;
  let skipped = 0;

  for (const url of urls) {
    try {
      const res = await deleteVideoIfUnused(url);
      const meta = res?.metadata ?? res;
      if (meta?.deleted) cleaned += 1;
      else skipped += 1;
    } catch {
      skipped += 1;
    }
  }

  return { cleaned, skipped };
}

/**
 * Thư viện ảnh shop — tái sử dụng URL.
 * @returns {Promise<{ items: string[], error?: string }>}
 */
export async function getShopImageLibraryAction() {
  const denied = await requireAnyPermission('read:any', READ_MEDIA_LIBRARY_RESOURCES);
  if (denied) return { items: [], error: denied.error };

  try {
    const items = await getShopImageLibrary({ limit: 120 });
    return { items };
  } catch (err) {
    return { items: [], error: mutationErrorMessage(err, 'Không tải được thư viện ảnh') };
  }
}

/**
 * Thư viện video shop — tái sử dụng URL.
 * @returns {Promise<{ items: string[], error?: string }>}
 */
export async function getShopVideoLibraryAction() {
  const denied = await requirePermission('read:any', 'product');
  if (denied) return { items: [], error: denied.error };

  try {
    const items = await getShopVideoLibrary({ limit: 60 });
    return { items };
  } catch (err) {
    return { items: [], error: mutationErrorMessage(err, 'Không tải được thư viện video') };
  }
}
