/**
 * Sinh mã SKU từ mã định danh sản phẩm + tổ hợp phân loại.
 * KHÔNG dùng tên SP — tránh trùng khi nhiều SP có tiền tố giống nhau.
 */

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function slugifyCode(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Mã ngẫu nhiên cho SP mới (trước khi có _id).
 * VD: GM7X2K9P
 * @returns {string}
 */
export function generateProductCode() {
  let code = 'GM';
  for (let i = 0; i < 6; i += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

/**
 * SKU = {productCode}-{option1}-{option2}
 * VD: GM7X2K9P-HU-250G-NHUA-CAO-CAP
 *
 * @param {Array<{ options?: string[] }>} variations
 * @param {number[]} tierIdx
 * @param {string} [productCode] — mã định danh SP, không phải tên
 * @returns {string}
 */
export function buildSkuCodeFromVariations(variations, tierIdx, productCode = '') {
  const parts = (tierIdx ?? [])
    .map((idx, vi) => slugifyCode(variations[vi]?.options?.[idx]))
    .filter(Boolean);

  const prefix = slugifyCode(productCode).slice(0, 16);

  if (!parts.length) {
    return prefix.slice(0, 64);
  }

  const combined = parts.join('-');

  if (prefix) {
    return `${prefix}-${combined}`.slice(0, 64);
  }

  return combined.slice(0, 64);
}

/**
 * Đảm bảo mã SKU unique trong cùng batch submit.
 * @param {string[]} codes
 * @param {string} base
 * @returns {string}
 */
export function ensureUniqueSkuCode(codes, base) {
  let code = base || 'SKU';
  let n = 2;
  while (codes.includes(code)) {
    code = `${base}-${n}`;
    n += 1;
  }
  codes.push(code);
  return code;
}

/**
 * Chuẩn hóa mã do admin nhập (nếu có).
 * @param {string} raw
 * @returns {string}
 */
export function normalizeProductCodeInput(raw) {
  const code = slugifyCode(raw).slice(0, 16);
  return code.length >= 4 ? code : '';
}
