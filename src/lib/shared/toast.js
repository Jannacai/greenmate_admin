import { toast } from 'sonner';

/** @typedef {'success' | 'error' | 'warning' | 'info'} ToastType */

/** Thông báo từ query ?toast= sau redirect server action */
export const URL_TOAST_MESSAGES = {
  updated: {
    title: 'Cập nhật sản phẩm thành công!',
    description: 'Thay đổi đã được lưu.',
    type: 'success',
  },
  published: {
    title: 'Đăng bán thành công!',
    description: 'Sản phẩm đã publish và hiển thị trên cửa hàng.',
    type: 'success',
  },
  draft: {
    title: 'Đã lưu nháp',
    description: 'Sản phẩm ở dạng nháp — bạn có thể publish sau.',
    type: 'warning',
  },
  error: {
    title: 'Publish thất bại',
    description: 'Sản phẩm đã lưu nháp — vào chi tiết sản phẩm để publish lại.',
    type: 'error',
  },
  forbidden: {
    title: 'Không có quyền truy cập',
    description: 'Bạn không có quyền vào trang vừa yêu cầu.',
    type: 'warning',
  },
  deleted: {
    title: 'Đã xóa nguyên liệu',
    description: 'Mặt hàng đã được gỡ khỏi kho.',
    type: 'success',
  },
};

/**
 * @param {string} message
 * @param {{ description?: string, type?: ToastType, duration?: number }} [opts]
 */
export function notify(message, { description, type = 'success', duration = 5000 } = {}) {
  const options = { description, duration };

  switch (type) {
    case 'error':
      toast.error(message, options);
      break;
    case 'warning':
      toast.warning(message, options);
      break;
    case 'info':
      toast.info(message, options);
      break;
    default:
      toast.success(message, options);
  }
}

/** @param {string} [description] */
export function showSuccess(message, description) {
  notify(message, { description, type: 'success' });
}

/** @param {string} [description] */
export function showError(message, description) {
  notify(message, { description, type: 'error' });
}

/** @param {string} [description] */
export function showWarning(message, description) {
  notify(message, { description, type: 'warning' });
}

/**
 * Hiển thị toast theo key URL (?toast=published).
 * @param {string} key
 */
export function showToastFromQuery(key) {
  const config = URL_TOAST_MESSAGES[key];
  if (!config) return;

  notify(config.title, {
    description: config.description,
    type: config.type,
  });
}

/**
 * Xóa param toast/forbidden khỏi URL hiện tại.
 * @param {string} pathname
 * @param {URLSearchParams} searchParams
 */
export function stripToastParams(pathname, searchParams) {
  const params = new URLSearchParams(searchParams.toString());
  params.delete('toast');
  params.delete('forbidden');
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
