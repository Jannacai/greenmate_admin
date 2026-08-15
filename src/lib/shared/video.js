import { getCanonicalStorageUrl, isCloudinaryUrl } from '@/lib/shared/image';

/** @type {Record<string, { width?: number, height?: number, crop?: string, quality?: string, format?: string, startOffset?: string }>} */
export const VIDEO_POSTER_PRESETS = {
  /** Thumbnail gallery dọc ~68×91 */
  thumb: { width: 96, height: 128, crop: 'fill', quality: 'auto', format: 'auto', startOffset: '0' },
  /** Preview form upload 112×80 */
  preview: { width: 224, height: 160, crop: 'fill', quality: 'auto', format: 'auto', startOffset: '0' },
  /** Thư viện video grid */
  library: { width: 320, height: 180, crop: 'fill', quality: 'auto', format: 'auto', startOffset: '0' },
  /** Khung card sản phẩm */
  card: { width: 600, height: 750, crop: 'fill', quality: 'auto', format: 'auto', startOffset: '0' },
};

/**
 * @param {string} [url]
 * @returns {boolean}
 */
export function isCloudinaryVideoUrl(url) {
  return isCloudinaryUrl(url) && url.includes('/video/upload/');
}

/**
 * @param {keyof VIDEO_POSTER_PRESETS | object} presetOrOptions
 */
function resolvePosterOptions(presetOrOptions) {
  if (typeof presetOrOptions === 'string') {
    return VIDEO_POSTER_PRESETS[presetOrOptions] ?? VIDEO_POSTER_PRESETS.thumb;
  }
  return presetOrOptions ?? VIDEO_POSTER_PRESETS.thumb;
}

/**
 * @param {{ width?: number, height?: number, crop?: string, quality?: string, format?: string, startOffset?: string }} opts
 */
function buildVideoTransformString(opts) {
  const tokens = [];
  if (opts.format) tokens.push(`f_${opts.format}`);
  if (opts.quality) tokens.push(`q_${opts.quality}`);
  if (opts.width) tokens.push(`w_${opts.width}`);
  if (opts.height) tokens.push(`h_${opts.height}`);
  if (opts.crop) tokens.push(`c_${opts.crop}`);
  if (opts.startOffset != null) tokens.push(`so_${opts.startOffset}`);
  return tokens.join(',');
}

/**
 * Frame đầu video Cloudinary → JPG nhẹ cho thumbnail (không tải file video).
 *
 * @param {string} src
 * @param {keyof VIDEO_POSTER_PRESETS | object} [preset='thumb']
 * @returns {string}
 */
export function getVideoPosterUrl(src, preset = 'thumb') {
  if (!src) return '';
  if (!isCloudinaryVideoUrl(src)) return '';

  const opts = resolvePosterOptions(preset);
  const transforms = buildVideoTransformString(opts);
  const canonical = getCanonicalStorageUrl(src);

  let url = transforms
    ? canonical.replace('/video/upload/', `/video/upload/${transforms}/`)
    : canonical;

  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) {
    return url.replace(/\.(mp4|webm|mov)(\?.*)?$/i, '.jpg$2');
  }

  return `${url}.jpg`;
}

/**
 * URL phát video Cloudinary — q_auto, f_auto giảm dung lượng stream.
 *
 * @param {string} src
 * @param {{ quality?: string, format?: string }} [options]
 * @returns {string}
 */
export function getOptimizedVideoUrl(src, options = { quality: 'auto', format: 'auto' }) {
  if (!src) return '';
  if (!isCloudinaryVideoUrl(src)) return src;

  const tokens = [];
  if (options.format) tokens.push(`f_${options.format}`);
  if (options.quality) tokens.push(`q_${options.quality}`);
  const transforms = tokens.join(',');
  if (!transforms) return getCanonicalStorageUrl(src);

  const canonical = getCanonicalStorageUrl(src);
  return canonical.replace('/video/upload/', `/video/upload/${transforms}/`);
}

/**
 * Dừng và giải phóng buffer video — gọi khi unmount hoặc đổi media.
 *
 * @param {HTMLVideoElement | null | undefined} el
 */
export function releaseVideoElement(el) {
  if (!el) return;
  el.pause();
  el.removeAttribute('src');
  el.load();
}
