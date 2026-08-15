/**
 * Ma trận quyền chuẩn accesscontrol (format `verb:scope`).
 * Backend setGrants() chỉ chấp nhận dạng này — KHÔNG dùng camelCase (readAny).
 */
export const RBAC_ACTIONS = [
  'create:any',
  'create:own',
  'read:any',
  'read:own',
  'update:any',
  'update:own',
  'delete:any',
  'delete:own',
];

export const ROLE_TYPES = ['USER', 'STAFF', 'ADMIN'];

/** Nhãn tiếng Việt cho loại vai trò */
export const ROLE_TYPE_LABELS = {
  USER: 'Khách hàng',
  STAFF: 'Nhân viên',
  ADMIN: 'Quản trị viên',
};

/** Màu chữ theo loại tài khoản — không dùng nền/viền */
export const ROLE_TYPE_TEXT_CLASSES = {
  ADMIN: 'text-red-600',
  STAFF: 'text-blue-700',
  USER: 'text-green-600',
};

/**
 * @param {string} roleType
 * @returns {string}
 */
export function getRoleTypeTextClass(roleType) {
  return ROLE_TYPE_TEXT_CLASSES[roleType] ?? 'text-gray-600';
}

/**
 * Nhóm quyền theo hành động — dùng cho UI chọn quyền.
 * `value` là mã gửi API; `label` / `hint` hiển thị cho người dùng.
 */
export const RBAC_ACTION_GROUPS = [
  {
    id: 'read',
    label: 'Xem dữ liệu',
    actions: [
      { value: 'read:any', label: 'Xem tất cả', shortLabel: 'Tất cả', hint: 'Xem mọi bản ghi trong module' },
      { value: 'read:own', label: 'Xem của mình', shortLabel: 'Của mình', hint: 'Chỉ xem bản ghi thuộc về mình' },
    ],
  },
  {
    id: 'create',
    label: 'Tạo mới',
    actions: [
      { value: 'create:any', label: 'Tạo cho bất kỳ ai', shortLabel: 'Bất kỳ ai', hint: 'Tạo bản ghi thay mặt người khác' },
      { value: 'create:own', label: 'Tạo cho mình', shortLabel: 'Của mình', hint: 'Chỉ tạo bản ghi gắn với tài khoản mình' },
    ],
  },
  {
    id: 'update',
    label: 'Chỉnh sửa',
    actions: [
      { value: 'update:any', label: 'Sửa tất cả', shortLabel: 'Tất cả', hint: 'Sửa mọi bản ghi trong module' },
      { value: 'update:own', label: 'Sửa của mình', shortLabel: 'Của mình', hint: 'Chỉ sửa bản ghi của mình' },
    ],
  },
  {
    id: 'delete',
    label: 'Xóa',
    actions: [
      { value: 'delete:any', label: 'Xóa tất cả', shortLabel: 'Tất cả', hint: 'Xóa mọi bản ghi trong module' },
      { value: 'delete:own', label: 'Xóa của mình', shortLabel: 'Của mình', hint: 'Chỉ xóa bản ghi của mình' },
    ],
  },
];

/** @type {Record<string, { label: string, hint?: string }>} */
const ACTION_LABEL_MAP = RBAC_ACTION_GROUPS.reduce((acc, group) => {
  group.actions.forEach((a) => {
    acc[a.value] = { label: a.label, hint: a.hint };
  });
  return acc;
}, {});

/** @type {Record<string, string>} */
const LEGACY_CAMEL_TO_COLON = {
  createAny: 'create:any',
  createOwn: 'create:own',
  readAny: 'read:any',
  readOwn: 'read:own',
  updateAny: 'update:any',
  updateOwn: 'update:own',
  deleteAny: 'delete:any',
  deleteOwn: 'delete:own',
};

/**
 * Chuẩn hóa action sang format accesscontrol (`read:any`).
 * @param {string} action
 * @returns {string}
 */
export function normalizeRbacAction(action) {
  if (!action || typeof action !== 'string') return action;
  if (action.includes(':')) return action;
  return LEGACY_CAMEL_TO_COLON[action] ?? action;
}

/**
 * Nhãn tiếng Việt cho mã quyền.
 * @param {string} action
 * @returns {string}
 */
export function getActionLabel(action) {
  const key = normalizeRbacAction(action);
  return ACTION_LABEL_MAP[key]?.label ?? key;
}

/**
 * Chuẩn hóa payload grants trước khi gửi API.
 * @param {object[]} grants
 * @returns {object[]}
 */
export function normalizeGrantsPayload(grants) {
  return (grants ?? []).map((grant) => ({
    ...grant,
    actions: (grant.actions ?? []).map(normalizeRbacAction),
  }));
}

/**
 * @param {string} roleType
 * @returns {string}
 */
export function getRoleTypeLabel(roleType) {
  return ROLE_TYPE_LABELS[roleType] ?? roleType;
}
