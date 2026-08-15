import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Đăng nhập',
};

/**
 * @param {{ searchParams: Promise<{ reason?: string, from?: string }> }} props
 */
export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const reason = params?.reason ?? '';

  return (
    <div className="min-h-screen flex">

      {/* ── Cột trái: Brand panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#6B4E3D] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white/30" />
          <div className="absolute top-40 left-40 w-40 h-40 rounded-full border border-white/20" />
          <div className="absolute bottom-32 right-20 w-80 h-80 rounded-full border border-white/20" />
          <div className="absolute bottom-12 right-40 w-48 h-48 rounded-full border border-white/10" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#D4A373] rounded-xl flex items-center justify-center">
              <span className="text-[#6B4E3D] font-bold text-lg">G</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">GreenMate</span>
          </div>
          <p className="text-white/60 text-sm pl-[52px]">Admin Dashboard</p>
        </div>

        {/* Tagline giữa trang */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-white text-4xl font-bold leading-tight">
            Quản lý thông minh,<br />
            <span className="text-[#D4A373]">phát triển bền vững</span>
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            Kiểm soát toàn bộ hệ thống GreenMate — từ sản phẩm, đơn hàng đến
            khách hàng trên một nền tảng duy nhất.
          </p>

          {/* Stats nhỏ */}
          <div className="flex gap-8 pt-4">
            {[
              { label: 'Sản phẩm',  value: '50+' },
              { label: 'Đơn / ngày', value: '200+' },
              { label: 'Khách hàng', value: '5.000+' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-white text-2xl font-bold">{value}</p>
                <p className="text-white/50 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} GreenMate. All rights reserved.
        </p>
      </div>

      {/* ── Cột phải: Form ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-[#6B4E3D] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-base">G</span>
            </div>
            <span className="text-brand-dark text-xl font-bold">GreenMate Admin</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-brand-dark">Đăng nhập</h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Nhập thông tin tài khoản quản trị để tiếp tục
            </p>
          </div>

          <LoginForm reason={reason} />
        </div>
      </div>

    </div>
  );
}
