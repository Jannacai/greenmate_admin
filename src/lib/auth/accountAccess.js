/**
 * Nhận diện lỗi 403 do tài khoản bị khóa / chờ duyệt (không phải thiếu quyền RBAC).
 *
 * @param {string} [message]
 * @returns {'blocked'|'pending'|'session'|null}
 */
export function getAccountAccessDeniedReason(message = '') {
  const msg = String(message).toLowerCase();

  if (msg.includes('bị khóa') || msg.includes('bi khoa')) {
    return 'blocked';
  }
  if (
    msg.includes('chờ')
    || msg.includes('phê duyệt')
    || msg.includes('xác thực')
    || msg.includes('cho duyet')
  ) {
    return 'pending';
  }
  if (msg.includes('relogin') || msg.includes('something wrong')) {
    return 'session';
  }

  return null;
}

/**
 * URL xóa session — Route Handler (Next.js không cho sửa cookie trong Server Component).
 * @param {'blocked'|'pending'|'session'} reason
 */
export function getSessionClearPath(reason) {
  return `/api/auth/session-clear?reason=${reason}`;
}

/** @param {'blocked'|'pending'|'session'|string} reason */
export function getLoginReasonMessage(reason) {
  switch (reason) {
    case 'blocked':
      return 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.';
    case 'pending':
      return 'Tài khoản đang chờ duyệt hoặc chưa được kích hoạt.';
    case 'session':
      return 'Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.';
    default:
      return null;
  }
}
