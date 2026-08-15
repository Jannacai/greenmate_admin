import { getCanonicalStorageUrl } from '@/lib/shared/image';
import { getServerEnv } from '@/lib/shared/env';

export const VIDEO_ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const VIDEO_MAX_SIZE = 50 * 1024 * 1024;

/** @param {number} status @param {string} [message] */
export function mapVideoUploadError(status, message) {
  if (status === 404) {
    return 'API upload chưa sẵn sàng (404). Hãy restart server tipjs (npm start) rồi thử lại.';
  }
  if (status === 403) return message || 'Thiếu hoặc sai API key';
  if (status === 405) return 'Phiên đăng nhập hết hạn. Vui lòng đăng xuất và đăng nhập lại.';
  if (message?.includes('keyStore')) return 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.';
  return message || 'Upload video thất bại, vui lòng thử lại';
}

/**
 * @param {File | Blob & { name?: string, type?: string, size?: number }} file
 */
export function validateVideoUploadFile(file) {
  if (!file || typeof file === 'string') return 'Không có file';
  if (!VIDEO_ALLOWED_TYPES.includes(file.type)) {
    return 'Chỉ chấp nhận video MP4, WebM hoặc MOV';
  }
  if (file.size > VIDEO_MAX_SIZE) return 'Video tối đa 50MB';
  return null;
}

/**
 * Forward video lên tipjs → Cloudinary.
 *
 * @param {{
 *   file: File | Blob & { name?: string, type?: string, size?: number },
 *   token: string,
 *   clientId: string,
 * }} params
 * @returns {Promise<{ url?: string, publicId?: string, duration?: number|null, error?: string }>}
 */
export async function forwardVideoUpload({ file, token, clientId }) {
  const validationError = validateVideoUploadFile(file);
  if (validationError) return { error: validationError };

  const { apiUrl, apiKey } = getServerEnv();
  if (!apiKey) {
    return { error: 'Thiếu API_KEY trong .env.local của admin' };
  }

  const uploadBody = new FormData();
  const fileName = file.name || 'video.mp4';
  uploadBody.append('file', file, fileName);

  try {
    const res = await fetch(`${apiUrl}/upload/video`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        authorization: token,
        'x-client-id': clientId,
      },
      body: uploadBody,
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { error: mapVideoUploadError(res.status, data.message) };
    }

    const meta = data.metadata ?? {};
    const rawUrl = meta.url ?? meta.data?.url;

    if (typeof rawUrl !== 'string' || !rawUrl.startsWith('http')) {
      return { error: 'Server không trả về URL video hợp lệ' };
    }

    return {
      url: getCanonicalStorageUrl(rawUrl),
      publicId: meta.public_id,
      duration: meta.duration ?? null,
    };
  } catch (err) {
    return {
      error: err.message?.includes('ECONNREFUSED')
        ? `Không kết nối được API (${apiUrl}). Kiểm tra server tipjs đang chạy.`
        : (err.message ?? 'Upload video thất bại, vui lòng thử lại'),
    };
  }
}
