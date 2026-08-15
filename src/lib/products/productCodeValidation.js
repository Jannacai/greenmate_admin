/**
 * Validate / map lỗi liên quan product_code khi tạo hoặc sửa SP.
 */

import { checkProductCodeAvailable } from '@/lib/api/product';

/** @param {string} code */
function duplicateProductCodeMessage(code) {
  return `Mã "${code}" đã được sử dụng. Vui lòng chọn mã khác.`;
}

/**
 * Kiểm tra mã SP chưa tồn tại — gọi trước khi create/update.
 * @param {string} productCode
 * @param {string} [excludeProductId] — bỏ qua SP đang sửa
 * @returns {Promise<{ fieldErrors?: Record<string, string[]> } | null>}
 */
export async function validateProductCodeUnique(productCode, excludeProductId) {
  const code = String(productCode ?? '').trim();
  if (!code) return null;

  try {
    const res = await checkProductCodeAvailable(code, excludeProductId);
    const available = res?.metadata?.available ?? res?.available;

    if (available === false) {
      return { fieldErrors: { product_code: [duplicateProductCodeMessage(code)] } };
    }
  } catch {
    /* API lỗi — backend vẫn chặn khi lưu */
  }

  return null;
}

/**
 * Map lỗi API mutation → fieldErrors hoặc error chung.
 * @param {Error & { message?: string }} err
 * @returns {{ error?: string, fieldErrors?: Record<string, string[]> }}
 */
export function mapProductMutationError(err) {
  const msg = String(err?.message ?? '');

  if (
    /mã sản phẩm.*đã tồn tại/i.test(msg)
    || /duplicate key.*product_code/i.test(msg)
  ) {
    return {
      fieldErrors: {
        product_code: [
          msg.includes('đã tồn tại')
            ? msg
            : 'Mã sản phẩm đã tồn tại. Vui lòng chọn mã khác.',
        ],
      },
    };
  }

  if (/danh mục/i.test(msg)) {
    return { fieldErrors: { product_category_id: [msg] } };
  }

  return { error: msg || 'Thao tác thất bại' };
}
