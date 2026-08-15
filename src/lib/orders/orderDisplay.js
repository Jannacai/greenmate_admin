/**
 * Hiển thị đơn hàng admin — đồng bộ enum tipjs `order.model.js`.
 */

/** @type {Record<string, { label: string, badgeClass: string }>} */
export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Chờ xác nhận',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  confirmed: {
    label: 'Đã xác nhận',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  shipped: {
    label: 'Đang giao',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  delivered: {
    label: 'Hoàn thành',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-red-50 text-red-600 border-red-200',
  },
};

/** Nhãn nút chuyển trạng thái — khác badge (hành động, không phải trạng thái). */
export const ORDER_STATUS_ACTION_LABELS = {
  confirmed: 'Xác nhận đơn',
  shipped: 'Giao hàng',
  delivered: 'Hoàn thành đơn',
  cancelled: 'Hủy đơn',
};

/** @type {Record<string, string>} */
export const PAYMENT_METHOD_LABELS = {
  cod: 'COD — Thanh toán khi nhận',
  momo: 'MoMo',
  vnpay: 'VNPay',
  shoppeepay: 'ShopeePay',
};

/** Nhãn ngắn — cột list */
export const PAYMENT_METHOD_SHORT_LABELS = {
  cod: 'COD',
  momo: 'MoMo',
  vnpay: 'VNPay',
  shoppeepay: 'ShopeePay',
};

/** @type {Record<string, string>} */
export const PAYMENT_STATUS_LABELS = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
};

/**
 * @param {object | null | undefined} order
 * @param {{ short?: boolean }} [options]
 */
export function getOrderPaymentLabel(order, { short = false } = {}) {
  const method = order?.order_payment?.method ?? 'cod';
  const map = short ? PAYMENT_METHOD_SHORT_LABELS : PAYMENT_METHOD_LABELS;
  return map[method] ?? String(method);
}

/**
 * @param {object | null | undefined} order
 */
export function getOrderStatusKey(order) {
  const key = order?.order_status ?? 'pending';
  return ORDER_STATUS_CONFIG[key] ? key : 'pending';
}

/**
 * @param {object | null | undefined} order
 */
export function getOrderCustomerName(order) {
  if (order?.customer_name) return order.customer_name;
  const user = order?.order_userId;
  if (user && typeof user === 'object') return user.user_name ?? 'Khách hàng';
  return 'Khách hàng';
}

/**
 * @param {object | null | undefined} order
 */
export function getOrderCustomerEmail(order) {
  if (order?.customer_email) return order.customer_email;
  const user = order?.order_userId;
  if (user && typeof user === 'object') return user.user_email ?? '';
  return order?.order_shipping?.state ?? '';
}

/**
 * Mã khách hàng (user_id public) — fallback Mongo `_id` nếu chưa populate.
 * @param {object | null | undefined} order
 */
export function getOrderCustomerId(order) {
  const user = order?.order_userId;
  if (user && typeof user === 'object') {
    return String(user.user_id || user._id || '').trim() || '—';
  }
  if (user != null && user !== '') return String(user);
  return '—';
}

/**
 * Mongo `_id` khách — dùng link `/customers/[id]`.
 * @param {object | null | undefined} order
 * @returns {string | null}
 */
export function getOrderCustomerMongoId(order) {
  const user = order?.order_userId;
  if (user && typeof user === 'object' && user._id) return String(user._id);
  if (typeof user === 'string' && user.trim()) return user.trim();
  return null;
}

/**
 * @param {object | null | undefined} order
 */
export function getOrderCustomerPhone(order) {
  if (order?.customer_phone) return String(order.customer_phone);
  const user = order?.order_userId;
  if (user && typeof user === 'object' && user.user_phone) return String(user.user_phone);
  return '';
}

/**
 * @param {object | null | undefined} order
 */
export function getOrderPaymentStatusLabel(order) {
  const status = order?.order_payment?.status ?? 'pending';
  return PAYMENT_STATUS_LABELS[status] ?? String(status);
}

/** @type {Record<string, string>} */
export const ORDER_DELIVERY_STATUS_LABELS = {
  pending: 'Chưa giao',
  confirmed: 'Chuẩn bị giao',
  shipped: 'Đang giao hàng',
  delivered: 'Đã giao',
  cancelled: '—',
};

/**
 * @param {string} [orderStatus]
 */
export function getOrderDeliveryStatusLabel(orderStatus) {
  const key = orderStatus ?? 'pending';
  return ORDER_DELIVERY_STATUS_LABELS[key] ?? '—';
}

/**
 * Parse `order_shipping.street` — format tipjs: `{line} ({recipient} — {phone})`.
 *
 * @param {string} [street]
 */
export function parseOrderShippingStreet(street = '') {
  const raw = String(street).trim();
  const match = raw.match(/^(.+?)\s*\((.+?)\s*—\s*([^)]+)\)\s*$/);
  if (match) {
    return {
      addressLine: match[1].trim(),
      recipient: match[2].trim(),
      phone: match[3].trim(),
      full: raw,
    };
  }
  return { addressLine: raw, recipient: '', phone: '', full: raw };
}

/**
 * Email liên hệ giao hàng (lưu trong `order_shipping.state`).
 *
 * @param {object | null | undefined} order
 */
export function getOrderShippingContactEmail(order) {
  return String(order?.order_shipping?.state ?? '').trim();
}

/**
 * Chi tiết giao hàng đã tách field — dùng cột spreadsheet admin.
 *
 * @param {object | null | undefined} order
 */
export function getOrderShippingDetails(order) {
  const shipping = order?.order_shipping ?? {};
  const parsed = parseOrderShippingStreet(shipping.street);
  const contactEmail = getOrderShippingContactEmail(order);
  const fallbackPhone = getOrderCustomerPhone(order);
  const fallbackName = getOrderCustomerName(order);

  const addressLine = parsed.addressLine || String(shipping.street ?? '').trim();
  const province = String(shipping.city ?? '').trim();
  const country = String(shipping.country ?? '').trim() || 'Việt Nam';

  const fullAddress = [addressLine, province, country].filter(Boolean).join(', ');

  return {
    recipient: parsed.recipient || fallbackName,
    phone: parsed.phone || fallbackPhone,
    email: contactEmail || getOrderCustomerEmail(order),
    addressLine: addressLine || '—',
    province: province || '—',
    country,
    fullAddress: fullAddress || '—',
    deliveryStatus: getOrderDeliveryStatusLabel(order?.order_status),
    feeShip: Number(order?.order_checkout?.feeShip) || 0,
  };
}

/**
 * @param {string} [value]
 */
function normalizeOrderPersonName(value) {
  return String(value ?? '')
    .replace(/^(anh|chị)\s+/i, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * @param {string} [recipient]
 * @param {string} [customerName]
 */
export function isSameOrderRecipient(recipient, customerName) {
  const left = normalizeOrderPersonName(recipient);
  const right = normalizeOrderPersonName(customerName);
  return Boolean(left && right && left === right);
}

/**
 * Dòng giao hàng trong cột Đơn hàng — chỉ địa chỉ (không lặp liên hệ đã có ở cột Khách hàng).
 *
 * @param {object | null | undefined} order
 * @returns {Array<{ label: string, value: string }>}
 */
export function getOrderShippingSheetRows(order) {
  const shipping = getOrderShippingDetails(order);
  const customerName = getOrderCustomerName(order);
  /** @type {Array<{ label: string, value: string }>} */
  const rows = [];

  if (shipping.recipient && !isSameOrderRecipient(shipping.recipient, customerName)) {
    rows.push({ label: 'Người nhận', value: shipping.recipient });
  }

  rows.push(
    { label: 'Địa chỉ', value: shipping.addressLine },
    { label: 'Tỉnh / TP', value: shipping.province },
    { label: 'Quốc gia', value: shipping.country },
  );

  return rows;
}

/**
 * @param {string} currentStatus
 * @returns {Array<{ value: string, label: string }>}
 */
export function getNextOrderStatusOptions(currentStatus) {
  const transitions = {
    pending: [
      { value: 'confirmed', label: ORDER_STATUS_ACTION_LABELS.confirmed },
      { value: 'cancelled', label: ORDER_STATUS_ACTION_LABELS.cancelled },
    ],
    confirmed: [
      { value: 'shipped', label: ORDER_STATUS_ACTION_LABELS.shipped },
      { value: 'cancelled', label: ORDER_STATUS_ACTION_LABELS.cancelled },
    ],
    shipped: [
      { value: 'delivered', label: ORDER_STATUS_ACTION_LABELS.delivered },
    ],
    delivered: [],
    cancelled: [],
  };

  return transitions[currentStatus] ?? [];
}
