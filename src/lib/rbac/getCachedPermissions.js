/**
 * Dedupe fetch permissions trong cùng request (layout + page).
 * Fail-closed: lỗi API → throw, không trả grants rỗng im lặng.
 */

import { cache } from 'react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getMyPermissions } from '@/lib/api/permissions';
import { normalizeMyPermissions } from '@/lib/rbac/permissions';

export class PermissionsLoadError extends Error {
  /**
   * @param {string} [message]
   */
  constructor(message = 'Không tải được quyền truy cập') {
    super(message);
    this.name = 'PermissionsLoadError';
  }
}

export const getCachedMyPermissions = cache(async () => {
  try {
    const raw = await getMyPermissions();
    return normalizeMyPermissions(raw);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    throw new PermissionsLoadError();
  }
});
