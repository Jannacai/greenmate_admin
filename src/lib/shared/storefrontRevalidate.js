/**
 * Notify greenmate_fe xóa cache Next.js sau khi admin thay đổi dữ liệu.
 *
 * Gọi fire-and-forget — không throw, không block mutation nếu FE đang down.
 * FE tự fallback về TTL cache (1 giờ) nếu webhook fail.
 *
 * Yêu cầu .env.local:
 *   FE_URL=http://localhost:3001   ← port storefront FE (KHÔNG phải admin)
 *   REVALIDATE_SECRET=<cùng giá trị với greenmate_fe>
 *
 * Gửi secret qua header `x-revalidate-secret` (không dùng query string).
 * Lưu ý port: nếu chạy đồng thời admin + FE, app khởi động sau thường là 3001.
 * Mở terminal FE và xem dòng "Local: http://localhost:XXXX" để chắc chắn.
 */

/**
 * @param {string} tag - Cache tag muốn xóa bên FE (VD: 'banners', 'products', 'product:slug-sp')
 * @returns {Promise<void>}
 */
export async function notifyStorefrontRevalidate(tag) {
  const feUrl = process.env.FE_URL?.trim();
  const secret = process.env.REVALIDATE_SECRET?.trim();

  if (!feUrl || !secret) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[revalidate] Bỏ qua: thiếu FE_URL hoặc REVALIDATE_SECRET trong .env.local',
      );
    }
    return;
  }

  try {
    const url = `${feUrl}/api/revalidate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ tag }),
      // timeout ngắn — không để mutation bị treo vì FE chậm
      signal: AbortSignal.timeout(3000),
    });

    if (process.env.NODE_ENV === 'development') {
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        console.info(`[revalidate] FE cache đã xóa tag "${tag}"`, data);
        return;
      }
      const text = await res.text().catch(() => '');
      const hint =
        res.status === 404
          ? ' — FE_URL sai port? (admin thường :3000, storefront thường :3001 khi chạy song song)'
          : res.status === 401
            ? ' — REVALIDATE_SECRET không khớp giữa admin và greenmate_fe'
            : '';
      console.warn(`[revalidate] FE trả lỗi ${res.status}: ${text}${hint}`);
    }
  } catch (err) {
    // Không throw — mutation admin vẫn thành công dù FE không phản hồi
    if (process.env.NODE_ENV === 'development') {
      console.warn('[revalidate] Không thể gọi FE webhook:', err?.message);
    }
  }
}
