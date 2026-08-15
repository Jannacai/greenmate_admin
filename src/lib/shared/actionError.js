/**
 * Chuyển lỗi catch → message an toàn cho UI — không lộ stack/MongoDB/internal path.
 */

const TECHNICAL_PATTERN =
  /mongodb|e11000|keyStore|ECONNREFUSED|ENOTFOUND|SyntaxError|TypeError|undefined is not|at \w+\(|\.js:\d+|\/api\/v1\//i;

const AUTH_SAFE_PATTERN =
  /quá nhiều lần|sai mật khẩu|không tồn tại|tài khoản|bị khóa|chưa kích hoạt|pending|đăng nhập|api key|phiên/i;

/**
 * Lỗi mutation / CRUD — luôn dùng fallback tiếng Việt cố định.
 * @param {unknown} err
 * @param {string} fallback
 */
export function mutationErrorMessage(err, fallback) {
  void err;
  return fallback;
}

/**
 * Lỗi đăng nhập — cho phép message user-facing từ tipjs nếu an toàn.
 * @param {unknown} err
 * @param {string} fallback
 */
export function authErrorMessage(err, fallback) {
  const msg = typeof err?.message === 'string' ? err.message.trim() : '';
  if (!msg || msg.length > 160 || TECHNICAL_PATTERN.test(msg)) return fallback;
  if (!AUTH_SAFE_PATTERN.test(msg)) return fallback;
  return msg;
}

/**
 * Lỗi upload — map một số mã kết nối, còn lại fallback.
 * @param {unknown} err
 * @param {string} fallback
 */
export function uploadErrorMessage(err, fallback) {
  const msg = typeof err?.message === 'string' ? err.message.trim() : '';
  if (msg?.includes('ECONNREFUSED')) {
    return 'Không kết nối được API. Kiểm tra server tipjs đang chạy.';
  }
  if (!msg || TECHNICAL_PATTERN.test(msg)) return fallback;
  return fallback;
}
