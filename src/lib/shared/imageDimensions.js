/**
 * @param {{ width: number, height: number }} size
 */
export function formatImagePixelSize({ width, height }) {
  return `${width}×${height}px`;
}

/**
 * @param {File} file
 * @param {{ width: number, height: number }} required
 * @returns {Promise<{ ok: true } | { ok: false, message: string }>}
 */
export function validateImageFileMinDimensions(file, required) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.naturalWidth >= required.width && img.naturalHeight >= required.height) {
        resolve({ ok: true });
        return;
      }
      resolve({
        ok: false,
        message: `Kích thước ảnh tối thiểu ${formatImagePixelSize(required)} (hiện tại: ${img.naturalWidth}×${img.naturalHeight}px)`,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ ok: false, message: 'Không đọc được kích thước ảnh' });
    };

    img.src = objectUrl;
  });
}

/**
 * @param {string} url
 * @param {{ width: number, height: number }} required
 * @returns {Promise<{ ok: true } | { ok: false, message: string }>}
 */
export function validateImageUrlMinDimensions(url, required) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      if (img.naturalWidth >= required.width && img.naturalHeight >= required.height) {
        resolve({ ok: true });
        return;
      }
      resolve({
        ok: false,
        message: `Kích thước ảnh tối thiểu ${formatImagePixelSize(required)} (hiện tại: ${img.naturalWidth}×${img.naturalHeight}px)`,
      });
    };

    img.onerror = () => {
      resolve({ ok: false, message: 'Không đọc được kích thước ảnh từ thư viện' });
    };

    img.src = url;
  });
}

/**
 * @param {File} file
 * @param {{ width: number, height: number }} required
 * @returns {Promise<{ ok: true } | { ok: false, message: string }>}
 */
export function validateImageFileDimensions(file, required) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.naturalWidth === required.width && img.naturalHeight === required.height) {
        resolve({ ok: true });
        return;
      }
      resolve({
        ok: false,
        message: `Kích thước ảnh phải là ${formatImagePixelSize(required)} (hiện tại: ${img.naturalWidth}×${img.naturalHeight}px)`,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ ok: false, message: 'Không đọc được kích thước ảnh' });
    };

    img.src = objectUrl;
  });
}

/**
 * @param {string} url
 * @param {{ width: number, height: number }} required
 * @returns {Promise<{ ok: true } | { ok: false, message: string }>}
 */
export function validateImageUrlDimensions(url, required) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      if (img.naturalWidth === required.width && img.naturalHeight === required.height) {
        resolve({ ok: true });
        return;
      }
      resolve({
        ok: false,
        message: `Kích thước ảnh phải là ${formatImagePixelSize(required)} (hiện tại: ${img.naturalWidth}×${img.naturalHeight}px)`,
      });
    };

    img.onerror = () => {
      resolve({ ok: false, message: 'Không đọc được kích thước ảnh từ thư viện' });
    };

    img.src = url;
  });
}
