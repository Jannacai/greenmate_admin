/**
 * Biến môi trường server — chỉ đọc từ `.env.local` (Next.js tự load).
 *
 * Cần có trong `.env.local`:
 *   NEXT_PUBLIC_API_URL=http://localhost:3055/api/v1
 *   API_KEY=<key khớp tipjs>
 *
 * Production: cả hai biến bắt buộc — thiếu sẽ throw lúc khởi tạo.
 */

const DEV_DEFAULT_API_URL = 'http://localhost:3055/api/v1';

/** @type {{ apiUrl: string, apiKey: string, isProd: boolean } | null} */
let cached = null;

/**
 * @returns {{ apiUrl: string, apiKey: string, isProd: boolean }}
 */
export function getServerEnv() {
  if (cached) return cached;

  const isProd = process.env.NODE_ENV === 'production';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || DEV_DEFAULT_API_URL;
  const apiKey = process.env.API_KEY?.trim() ?? '';

  if (isProd) {
    if (!process.env.NEXT_PUBLIC_API_URL?.trim()) {
      throw new Error(
        'Production: thiếu NEXT_PUBLIC_API_URL trong .env.local',
      );
    }
    if (!apiKey) {
      throw new Error('Production: thiếu API_KEY trong .env.local');
    }
  }

  cached = { apiUrl, apiKey, isProd };
  return cached;
}
