/**
 * Khóa / mở khóa nhân viên cần xác nhận mật khẩu admin.
 * Duyệt pending → active không cần.
 *
 * @param {string} currentStatus
 * @param {string} nextStatus
 */
export function staffStatusRequiresPassword(currentStatus, nextStatus) {
  const current = String(currentStatus ?? '').toLowerCase();
  const next = String(nextStatus ?? '').toLowerCase();

  if (next === 'block') return true;
  if (current === 'block' && next === 'active') return true;
  return false;
}

/** @param {string} nextStatus @param {string} [currentStatus] */
export function getStaffStatusActionLabel(nextStatus, currentStatus = '') {
  const next = String(nextStatus).toLowerCase();
  const current = String(currentStatus).toLowerCase();

  if (next === 'block') return 'Khóa tài khoản';
  if (current === 'block' && next === 'active') return 'Mở khóa tài khoản';
  if (next === 'active' && current === 'pending') return 'Duyệt tài khoản';
  return 'Cập nhật trạng thái';
}
