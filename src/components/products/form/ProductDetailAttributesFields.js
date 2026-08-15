'use client';

import { AdminField, AdminTextarea } from '@/components/admin';
import { PRODUCT_DETAIL_ATTRIBUTE_FIELDS } from '@/lib/products/productInfoAttributes';

/**
 * Các trường mô tả chi tiết SP — lưu trong product_attributes, không bắt buộc.
 *
 * @param {{
 *   register: import('react-hook-form').UseFormRegister<object>,
 *   errors?: Record<string, { message?: string } | undefined>,
 * }} props
 */
export default function ProductDetailAttributesFields({ register, errors = {} }) {
  return (
    <div className="space-y-3">
      {PRODUCT_DETAIL_ATTRIBUTE_FIELDS.map((field) => (
        <AdminField
          key={field.key}
          label={field.label}
          error={errors[field.key]?.message}
        >
          <AdminTextarea
            {...register(field.key)}
            rows={field.rows ?? 3}
            placeholder={field.placeholder}
            error={Boolean(errors[field.key])}
            className="resize-y max-h-64 text-sm"
          />
        </AdminField>
      ))}
    </div>
  );
}
