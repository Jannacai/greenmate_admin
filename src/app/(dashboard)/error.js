'use client';

/**
 * Error boundary — toàn bộ khu vực dashboard.
 */
export default function DashboardError({ reset }) {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md rounded-xl border border-red-100 bg-red-50/50 px-6 py-8">
        <p className="text-3xl font-bold text-red-400">!</p>
        <h2 className="mt-3 text-lg font-bold text-brand-dark">Không tải được trang</h2>
        <p className="mt-2 text-sm text-gray-600">
          Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-sidebar-hover transition-colors"
          >
            Thử lại
          </button>
          <a
            href="/dashboard"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-brand-primary hover:text-brand-primary transition-colors"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    </main>
  );
}
