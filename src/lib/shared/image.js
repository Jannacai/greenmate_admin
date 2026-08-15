/**
 * Cloudinary image optimization — Coolmate-style CDN delivery.
 *
 * Quy ước lưu MongoDB:
 *   - Luôn lưu `url` gốc (secure_url, KHÔNG có transform trong path)
 *   - Khi render: gọi getOptimizedImageUrl(url, preset) → f_auto,q_auto,w_XXX
 *
 * @see https://cloudinary.com/documentation/image_transformations
 */

const CLOUDINARY_HOST = 'res.cloudinary.com';

/** @type {Record<string, { width?: number, height?: number, crop?: string, quality?: string, format?: string }>} */
export const IMAGE_PRESETS = {
  /** Thumbnail SKU matrix 56×56 */
  thumb: { width: 96, height: 96, crop: 'fill', quality: 'auto', format: 'auto' },
  /** Preview admin uploader */
  preview: { width: 400, crop: 'limit', quality: 'auto', format: 'auto' },
  /** Card danh sách sản phẩm */
  card: { width: 600, crop: 'limit', quality: 'auto', format: 'auto' },
  /** Ảnh chi tiết / zoom */
  detail: { width: 1200, crop: 'limit', quality: 'auto', format: 'auto' },
  /** Preview banner admin — đủ nét trong form tạo/sửa */
  bannerAdmin: { width: 1200, crop: 'limit', quality: 'auto', format: 'auto' },
  /** Hover ảnh thứ 2 trên card FE */
  hover: { width: 800, crop: 'limit', quality: 'auto', format: 'auto' },
};

/** Widths dùng cho srcSet theo preset */
export const PRESET_SRCSET_WIDTHS = {
  thumb: [96, 192],
  preview: [200, 400, 600],
  card: [300, 400, 600, 800],
  detail: [600, 800, 1200, 1600],
  bannerAdmin: [480, 720, 960, 1200, 1600],
  hover: [400, 600, 800],
};

/** sizes attribute mặc định theo preset */
export const PRESET_SIZES = {
  thumb: '96px',
  preview: '(max-width: 768px) 100vw, 400px',
  card: '(max-width: 768px) 50vw, 300px',
  detail: '(max-width: 768px) 100vw, 600px',
  bannerAdmin: '(max-width: 768px) 100vw, 640px',
  hover: '(max-width: 768px) 50vw, 400px',
};

/**
 * @param {string} [url]
 * @returns {boolean}
 */
export function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes(CLOUDINARY_HOST);
}

/**
 * Kiểm tra segment Cloudinary transform (f_auto, w_400, c_limit...).
 * @param {string} segment
 */
function isTransformSegment(segment) {
  if (!segment || segment.startsWith('v') && /^v\d+$/.test(segment)) return false;
  return segment.split(',').every((token) => /^[a-z0-9]+_[^,/]+$/i.test(token.trim()));
}

/**
 * Bỏ mọi transform trong URL Cloudinary → trả về canonical URL để lưu DB.
 *
 * @param {string} url
 * @returns {string}
 */
export function getCanonicalStorageUrl(url) {
  if (!url || !isCloudinaryUrl(url)) return url ?? '';

  const videoMarker = '/video/upload/';
  const imageMarker = '/upload/';
  const marker = url.includes(videoMarker) ? videoMarker : imageMarker;
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const prefix = url.slice(0, idx + marker.length);
  const segments = url.slice(idx + marker.length).split('/');

  while (segments.length > 0 && isTransformSegment(segments[0])) {
    segments.shift();
  }

  return prefix + segments.join('/');
}

/**
 * @param {import('./image.js').IMAGE_PRESETS[keyof IMAGE_PRESETS] | string} presetOrOptions
 * @returns {{ width?: number, height?: number, crop?: string, quality?: string, format?: string }}
 */
function resolveOptions(presetOrOptions) {
  if (typeof presetOrOptions === 'string') {
    return IMAGE_PRESETS[presetOrOptions] ?? IMAGE_PRESETS.preview;
  }
  return presetOrOptions ?? IMAGE_PRESETS.preview;
}

/**
 * Build chuỗi transform Cloudinary.
 * @param {{ width?: number, height?: number, crop?: string, quality?: string, format?: string }} opts
 */
function buildTransformString(opts) {
  const tokens = [];
  if (opts.format) tokens.push(`f_${opts.format}`);
  if (opts.quality) tokens.push(`q_${opts.quality}`);
  if (opts.width) tokens.push(`w_${opts.width}`);
  if (opts.height) tokens.push(`h_${opts.height}`);
  if (opts.crop) tokens.push(`c_${opts.crop}`);
  return tokens.join(',');
}

/**
 * Tạo URL Cloudinary tối ưu cho thiết bị — f_auto (WebP/AVIF), q_auto, resize.
 *
 * @param {string} src — URL gốc từ DB hoặc secure_url sau upload
 * @param {keyof IMAGE_PRESETS | object} [preset='preview']
 * @returns {string}
 */
export function getOptimizedImageUrl(src, preset = 'preview') {
  if (!src) return '';

  const opts = resolveOptions(preset);
  const transforms = buildTransformString(opts);
  if (!transforms) return src;

  if (!isCloudinaryUrl(src)) return src;

  const canonical = getCanonicalStorageUrl(src);
  return canonical.replace('/upload/', `/upload/${transforms}/`);
}

/**
 * Responsive srcSet cho `<img>` — browser chọn width phù hợp.
 *
 * @param {string} src
 * @param {number[]} [widths]
 * @returns {string|undefined}
 */
export function getOptimizedSrcSet(src, widths = PRESET_SRCSET_WIDTHS.preview) {
  if (!src || !isCloudinaryUrl(src)) return undefined;

  return widths
    .map((w) => {
      const url = getOptimizedImageUrl(src, { width: w, crop: 'limit', quality: 'auto', format: 'auto' });
      return `${url} ${w}w`;
    })
    .join(', ');
}

/**
 * Lấy sizes attribute theo preset.
 * @param {keyof IMAGE_PRESETS} [preset='preview']
 * @returns {string}
 */
export function getImageSizes(preset = 'preview') {
  return PRESET_SIZES[preset] ?? PRESET_SIZES.preview;
}

/**
 * Lấy public_id Cloudinary từ URL (dùng xóa asset).
 * @param {string} url
 * @returns {string|null}
 */
export function extractPublicIdFromUrl(url) {
  if (!url || !isCloudinaryUrl(url)) return null;

  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  const segments = url.slice(idx + marker.length).split('/');

  while (segments.length && (isTransformSegment(segments[0]) || /^v\d+$/.test(segments[0]))) {
    segments.shift();
  }

  if (!segments.length) return null;

  const last = segments.pop();
  const withoutExt = last.replace(/\.[^.]+$/, '');
  if (withoutExt) segments.push(withoutExt);

  return segments.join('/') || null;
}
