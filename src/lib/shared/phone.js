/**
 * Chuẩn hóa & validate SĐT Việt Nam — khớp logic backend tipjs.
 */

/**
 * @param {string|number|null|undefined} value
 * @returns {string}
 */
export function normalizePhone(value) {
  if (value === undefined || value === null) return '';

  let raw = String(value).trim().replace(/[\s.-]/g, '');
  if (!raw) return '';

  if (raw.startsWith('+')) {
    raw = raw.slice(1);
  }

  if (/^84(3|5|7|8|9)\d{8}$/.test(raw)) {
    return raw;
  }

  if (/^0(3|5|7|8|9)\d{8}$/.test(raw)) {
    return `84${raw.slice(1)}`;
  }

  return raw;
}

/**
 * @param {string|number|null|undefined} value
 * @returns {boolean}
 */
export function isValidVietnamesePhone(value) {
  const normalized = normalizePhone(value);
  return /^84(3|5|7|8|9)\d{8}$/.test(normalized);
}

/**
 * @param {string|number|null|undefined} value
 * @returns {string}
 */
export function toDisplayPhone(value) {
  const normalized = normalizePhone(value);
  if (!normalized.startsWith('84')) return String(value ?? '');
  return `0${normalized.slice(2)}`;
}

/**
 * Phân tích ô nhập chung Email/SĐT khi đăng nhập.
 * @param {string|number|null|undefined} value
 * @returns {{ type: 'email' | 'phone' | null, email: string, phone: string, error?: string }}
 */
export function parseLoginIdentifier(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) {
    return {
      type: null,
      email: '',
      phone: '',
      error: 'Email hoặc số điện thoại không được để trống',
    };
  }

  if (trimmed.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return {
        type: null,
        email: '',
        phone: '',
        error: 'Email không hợp lệ',
      };
    }

    return {
      type: 'email',
      email: trimmed.toLowerCase(),
      phone: '',
    };
  }

  if (isValidVietnamesePhone(trimmed)) {
    return {
      type: 'phone',
      email: '',
      phone: trimmed,
    };
  }

  return {
    type: null,
    email: '',
    phone: '',
    error: 'Email hoặc số điện thoại không hợp lệ',
  };
}
