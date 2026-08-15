'use client';

export default function VouchersError({ reset }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h2 className="text-lg font-bold text-brand-dark">Không tải được trang Voucher</h2>
      <p className="mt-2 text-sm text-gray-500">Không thể tải trang voucher. Vui lòng thử lại.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d5e30]"
      >
        Thử lại
      </button>
    </div>
  );
}
