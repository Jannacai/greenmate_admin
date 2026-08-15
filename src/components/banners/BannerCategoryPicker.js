'use client';

import { useEffect, useState } from 'react';
import { loadBannerCategoryOptionsAction } from '@/lib/actions/banner';
import { AdminField } from '@/components/admin';
import { cn } from '@/lib/shared/utils';

/**
 * Chọn danh mục L1/L2 cho banner strip.
 *
 * @param {{
 *   register: import('react-hook-form').UseFormRegister<Record<string, unknown>>,
 *   disabled?: boolean,
 *   error?: string,
 * }} props
 */
export default function BannerCategoryPicker({
  register,
  disabled = false,
  error,
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadBannerCategoryOptionsAction()
      .then((items) => {
        if (!cancelled) {
          setOptions(items ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminField
      label="Danh mục gắn banner"
      required
      error={error}
      hint="Cấp 1: strip trang chủ · Cấp 2: strip trang danh mục lớn"
    >
      <select
        {...register('category_id')}
        disabled={disabled || loading}
        className={cn(
          'w-full min-h-[44px] rounded-xl border bg-white px-3 text-sm text-brand-dark',
          error ? 'border-red-400' : 'border-gray-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50',
          (disabled || loading) && 'cursor-not-allowed opacity-60',
        )}
      >
        <option value="">{loading ? 'Đang tải danh mục…' : '— Chọn danh mục —'}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </AdminField>
  );
}
