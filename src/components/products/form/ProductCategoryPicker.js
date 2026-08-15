'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getCategoryLevel2OptionsAction } from '@/lib/actions/category';
import { AdminField, AdminSelect } from '@/components/admin';

/**
 * @param {unknown} left
 * @param {unknown} right
 */
function sameCategoryId(left, right) {
  if (left == null || right == null || left === '' || right === '') return false;
  return String(left) === String(right);
}

/**
 * Chọn danh mục cấp 2 theo product_type — options từ API
 * `GET /category/picker/level2?product_type=` (Server Action → tipjs).
 *
 * @param {{
 *   value: string,
 *   onChange: (next: string) => void,
 *   productType: string,
 *   errors: object,
 *   initialCategoryLabel?: string,
 * }} props
 */
export default function ProductCategoryPicker({
  value = '',
  onChange,
  productType,
  errors,
  initialCategoryLabel = '',
}) {
  const [options, setOptions] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loadedProductType, setLoadedProductType] = useState('');
  const prevProductTypeRef = useRef(productType);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (prevProductTypeRef.current === productType) return;
    prevProductTypeRef.current = productType;
    onChangeRef.current('');
  }, [productType]);

  useEffect(() => {
    if (!productType) return undefined;

    let cancelled = false;

    getCategoryLevel2OptionsAction(productType)
      .then((result) => {
        if (cancelled) return;

        if (result.error) {
          setOptions([]);
          setLoadError(result.error);
          setLoadedProductType(productType);
          return;
        }

        const items = result.items ?? [];
        setOptions(items);
        setLoadError('');
        setLoadedProductType(productType);
      })
      .catch(() => {
        if (cancelled) return;
        setOptions([]);
        setLoadError('Không tải được danh mục');
        setLoadedProductType(productType);
      });

    return () => { cancelled = true; };
  }, [productType]);

  const isLoading = Boolean(productType) && productType !== loadedProductType;

  const selectOptions = useMemo(() => {
    if (!productType || productType !== loadedProductType) return [];

    if (!value || options.some((row) => sameCategoryId(row._id, value))) {
      return options;
    }

    return [
      {
        _id: String(value),
        category_name: initialCategoryLabel || 'Danh mục đã chọn',
        category_is_active: true,
      },
      ...options,
    ];
  }, [options, productType, loadedProductType, value, initialCategoryLabel]);

  const fieldError = errors.product_category_id?.message || loadError;

  return (
    <AdminField
      label="Danh mục cấp 2"
      layout="row"
      compact
      hint="VD: Hạt điều, Óc chó"
      error={fieldError}
    >
      <AdminSelect
        name="product_category_id"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={Boolean(errors.product_category_id || loadError)}
        disabled={isLoading || !productType}
        className="h-9 min-h-9 px-2.5 text-sm"
      >
        <option value="">{isLoading ? 'Đang tải…' : '— Chọn danh mục —'}</option>
        {selectOptions.map((row) => (
          <option key={String(row._id)} value={String(row._id)}>
            {row.category_name}
            {!row.category_is_active ? ' (ẩn)' : ''}
          </option>
        ))}
      </AdminSelect>
    </AdminField>
  );
}
