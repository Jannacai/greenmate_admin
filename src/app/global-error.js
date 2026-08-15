'use client';

/**
 * Root error boundary — bắt lỗi ngoài (dashboard).
 */
export default function RootError({ reset }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#F8F9FA] antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <div className="max-w-md">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Có lỗi xảy ra</h2>
            <p className="mt-2 text-sm text-gray-500">
              Ứng dụng gặp sự cố. Vui lòng thử lại.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-lg bg-[#6B4E3D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5C4033]"
            >
              Thử lại
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
