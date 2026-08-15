import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes, loại bỏ conflict.
 * @param {...(string|undefined|null|false)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format số tiền sang VND.
 * @param {number} amount
 * @returns {string}  VD: "120.000₫"
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format số tiền cho input (chỉ phần số, có dấu chấm nghìn).
 * @param {number|string|null|undefined} amount
 * @returns {string}  VD: "10.000"
 */
export function formatVndInput(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return '';
  return n.toLocaleString('vi-VN');
}

/**
 * Parse chuỗi input VND → số nguyên.
 * @param {string} value
 * @returns {number}
 */
export function parseVndInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return 0;
  return Number(digits);
}

/**
 * Format ngày giờ.
 * @param {string|Date} date
 * @param {'date'|'datetime'|'time'} [mode='date']
 * @returns {string}
 */
export function formatDate(date, mode = 'date') {
  const d = new Date(date);
  if (mode === 'time')     return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  if (mode === 'datetime') return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Truncate chuỗi dài, thêm "..." ở cuối.
 * @param {string} str
 * @param {number} [maxLen=50]
 * @returns {string}
 */
export function truncate(str, maxLen = 50) {
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

/**
 * Chuẩn hóa chuỗi để so khớp tìm kiếm (bỏ dấu, lowercase).
 * @param {string} value
 */
export function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * MongoDB _id / ObjectId → string an toàn cho hiển thị & tìm kiếm.
 * @param {unknown} value
 */
export function stringifyMongoId(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if ('$oid' in value && value.$oid) return String(value.$oid);
    if (typeof value.toString === 'function') {
      const s = value.toString();
      if (s && s !== '[object Object]') return s;
    }
  }
  return String(value);
}
