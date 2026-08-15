'use client';

import Link from 'next/link';
import { AdminButton, AdminButtonGhost } from '@/components/admin';

export default function InventoryError({ reset }) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
      <p className="font-semibold text-brand-dark">Không tải được trang tồn kho</p>
      <p className="mt-2 text-sm text-red-600">Không thể tải trang tồn kho. Vui lòng thử lại.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <AdminButton type="button" onClick={reset}>
          Thử lại
        </AdminButton>
        <Link href="/inventory" className="inline-flex">
          <AdminButtonGhost type="button">Về danh sách</AdminButtonGhost>
        </Link>
      </div>
    </div>
  );
}
