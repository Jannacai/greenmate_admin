'use client';

import { AdminErrorState } from '@/components/admin';

export default function CollectionsError() {
  return (
    <div className="mx-auto max-w-6xl">
      <AdminErrorState message="Không tải được trang bộ sưu tập. Vui lòng thử lại." />
    </div>
  );
}
