'use client';

import { AdminErrorState } from '@/components/admin';

export default function BannersError() {
  return (
    <div className="mx-auto max-w-6xl">
      <AdminErrorState message="Không tải được trang banner. Vui lòng thử lại." />
    </div>
  );
}
