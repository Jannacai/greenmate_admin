'use client';

export default function StaffError({ error, reset }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 text-center">
      <div className="rounded-xl border border-red-100 bg-white px-6 py-8 shadow-sm">
        <h2 className="text-lg font-bold text-brand-dark">Lỗi tải nhân viên</h2>
        <p className="mt-2 text-sm text-gray-600">
          Không thể tải dữ liệu nhân viên. Vui lòng thử lại.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-[#2d5e30]"
          >
            Thử lại
          </button>
          <a
            href="/staff"
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:border-brand-primary hover:text-brand-primary"
          >
            Danh sách nhân viên
          </a>
        </div>
      </div>
    </main>
  );
}
