import { Inter } from 'next/font/google';
import './globals.css';

/** Sans-serif (không chân) — đồng bộ với greenmate_fe */
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-admin-sans',
  display: 'swap',
});

export const metadata = {
  title: {
    default:  'GreenMate Admin',
    template: '%s | GreenMate Admin',
  },
  description: 'Hệ thống quản trị GreenMate — sản phẩm, đơn hàng, khách hàng',
  robots: { index: false, follow: false }, // admin không index
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${inter.variable} h-full font-sans`} suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased font-sans`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
