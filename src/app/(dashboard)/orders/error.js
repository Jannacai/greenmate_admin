'use client';

import { AdminErrorState } from '@/components/admin';

export default function OrdersError() {
  return (
    <div className="mx-auto max-w-6xl">
      <AdminErrorState message="Không tải được trang đơn hàng. Vui lòng thử lại." />
    </div>
  );
}
