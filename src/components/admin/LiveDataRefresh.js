'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Tự làm mới Server Component theo chu kỳ khi tab đang hiển thị.
 * Near-realtime cho admin list/detail — không cần WebSocket.
 *
 * @param {number} [intervalMs]
 */
export function usePageAutoRefresh(intervalMs = 20000) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs]);
}

/**
 * @param {{ intervalMs?: number, label?: string }} props
 */
export default function LiveDataRefresh({
  intervalMs = 20000,
  label = 'Tự động cập nhật',
}) {
  usePageAutoRefresh(intervalMs);

  return (
    <p className="text-right text-[11px] leading-tight text-gray-400 whitespace-nowrap">
      {label} mỗi {Math.round(intervalMs / 1000)}s khi tab đang mở
    </p>
  );
}
