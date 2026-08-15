/**
 * Shop owner ID single-shop — dùng cho form SP, không thay thế admin_client_id (user auth).
 */

import { cookies } from 'next/headers';

/**
 * @returns {Promise<string>}
 */
export async function getAdminShopOwnerId() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_shop_id')?.value?.trim() ?? '';
}
