'use client';

import { useState, useEffect, useMemo, useDeferredValue, useCallback } from 'react';
import { cn, formatVndInput, parseVndInput } from '@/lib/shared/utils';
import { Input } from '@/components/ui/input';
import { SkuImageList, SkuVideoList, SkuRecipeEditor } from '@/components/products/form/SkuDetailFields';
import { buildSkuCodeFromVariations } from '@/lib/products/sku';
import { buildSkuTierParts, buildSkuDefaultSelectLabel } from '@/lib/products/productPreview';
import { validateSkuRecipe } from '@/lib/products/productForm';

/**
 * Danh sách SKU dạng card — không dùng bảng rộng, tránh scroll ngang.
 */
export default function SkuMatrix({
  variations,
  skus,
  productCode = '',
  isEdit = false,
  onSkuChange,
  showRecipeErrors = false,
}) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [skuSearch, setSkuSearch] = useState('');
  const deferredSkuSearch = useDeferredValue(skuSearch);

  const validVars = (variations ?? []).filter(
    (v) => v.name?.trim() && v.options?.filter(Boolean).length > 0,
  );

  const getSkuCode = useCallback((sku) => {
    const saved = sku.sku_code?.trim();
    if (saved) return saved;
    if (isEdit) return '—';
    return buildSkuCodeFromVariations(validVars, sku.sku_tier_idx, productCode) || '—';
  }, [isEdit, productCode, validVars]);

  const skuMatchesSearch = useCallback((sku, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const code = getSkuCode(sku).toLowerCase();
    if (code !== '—' && code.includes(q)) return true;

    const tierParts = buildSkuTierParts(sku, validVars);
    const haystack = [
      ...tierParts.map((part) => part.name),
      ...tierParts.map((part) => part.value),
      buildSkuDefaultSelectLabel(tierParts),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  }, [getSkuCode, validVars]);

  const visibleSkus = useMemo(() => {
    if (!skus?.length) return [];
    return skus
      .map((sku, index) => ({ sku, index }))
      .filter(({ sku }) => skuMatchesSearch(sku, deferredSkuSearch));
  }, [skus, deferredSkuSearch, skuMatchesSearch]);

  const isSearchPending = skuSearch !== deferredSkuSearch;

  useEffect(() => {
    if (!showRecipeErrors) return;
    const badIdx = skus.findIndex((sku) => validateSkuRecipe(sku.sku_recipe));
    if (badIdx >= 0) setExpandedIdx(badIdx);
  }, [showRecipeErrors, skus]);

  if (!skus || skus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-10 px-4 text-center">
        <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>
        <p className="text-sm text-gray-400">
          {validVars.length === 0
            ? 'Thêm phân loại có option → SKU tự tạo'
            : 'Đang tính các tổ hợp SKU…'}
        </p>
      </div>
    );
  }

  function update(index, field, value) {
    const next = skus.map((s, i) => {
      if (i !== index) {
        if (field === 'is_default' && value === true) return { ...s, is_default: false };
        return s;
      }
      return { ...s, [field]: value };
    });
    onSkuChange(next);
  }

  function toggleExpand(index) {
    setExpandedIdx((prev) => (prev === index ? null : index));
  }

  return (
    <div className="space-y-3">
      <div className="min-w-0">
        <Input
          type="search"
          value={skuSearch}
          onChange={(e) => setSkuSearch(e.target.value)}
          placeholder="Tìm theo mã SKU hoặc phân loại…"
          aria-label="Tìm SKU theo mã hoặc phân loại"
          className={cn(
            'h-9 text-sm',
            isSearchPending && 'opacity-60',
          )}
        />
        {skuSearch.trim() && (
          <p className="mt-1 text-xs text-gray-500">
            {visibleSkus.length} / {skus.length} SKU
            {visibleSkus.length === 0 ? ' — không có kết quả' : ''}
          </p>
        )}
      </div>

      {visibleSkus.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400">
          Không tìm thấy SKU phù hợp với &ldquo;{skuSearch.trim()}&rdquo;
        </div>
      ) : (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-start">
        {visibleSkus.map(({ sku, index: i }) => {
          const isOpen = expandedIdx === i;
          const imageCount = sku.sku_images?.length ?? 0;
          const videoCount = sku.sku_videos?.length ?? 0;
          const ingredientCount = (sku.sku_recipe ?? []).filter((row) => row.ingredient_id).length;
          const tierParts = buildSkuTierParts(sku, validVars);
          const code = getSkuCode(sku);
          const selectLabel = buildSkuDefaultSelectLabel(tierParts);
          const recipeError = showRecipeErrors ? validateSkuRecipe(sku.sku_recipe) : null;

          return (
            <div key={i} className="min-w-0">
              {tierParts.length > 0 ? (
                <div className="mb-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 px-0.5">
                  {tierParts.map((part, pi) => (
                    <span
                      key={`${part.name}-${pi}`}
                      className="inline-flex min-w-0 max-w-full items-center gap-x-1"
                    >
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
                        {part.name}:
                      </span>
                      <span className="text-sm font-semibold text-brand-dark">{part.value}</span>
                    </span>
                  ))}
                  {sku.is_default && (
                    <span className="rounded-full bg-brand-primary px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-white">
                      Mặc định
                    </span>
                  )}
                </div>
              ) : (
                <p className="mb-1.5 px-0.5 text-sm font-semibold text-brand-dark">—</p>
              )}

            <article
              className={cn(
                'min-w-0 rounded-xl border bg-white p-2.5 md:p-3',
                sku.is_default ? 'border-brand-primary/30 ring-1 ring-brand-primary/10' : 'border-gray-200',
              )}
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-700">
                    Mã SKU:
                  </span>
                  <span
                    className="block min-w-0 truncate font-mono text-[11px] font-bold leading-tight text-brand-dark md:text-xs"
                    title={code}
                  >
                    {code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(i)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium leading-tight transition-colors',
                    isOpen
                      ? 'bg-brand-primary text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-brand-primary hover:text-brand-primary',
                  )}
                >
                  {isOpen ? (
                    'Thu gọn'
                  ) : (
                    <span className="inline-flex flex-wrap items-center gap-x-1">
                      <span className="inline-flex items-center gap-0.5">
                        <span>Ảnh</span>
                        <span className="rounded-full bg-brand-accent px-1.5 text-[9px] font-semibold text-brand-dark">
                          {imageCount}
                        </span>
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="inline-flex items-center gap-0.5">
                        <span>Video</span>
                        <span className="rounded-full bg-brand-accent px-1.5 text-[9px] font-semibold text-brand-dark">
                          {videoCount}
                        </span>
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="inline-flex items-center gap-0.5">
                        <span>Nguyên liệu</span>
                        <span className="rounded-full bg-brand-accent px-1.5 text-[9px] font-semibold text-brand-dark">
                          {ingredientCount}
                        </span>
                      </span>
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5">
                <SkuField label="PHÂN LOẠI MẶC ĐỊNH">
                  <label className="flex h-9 min-h-0 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-2">
                    <input
                      type="radio"
                      name="sku_default"
                      checked={sku.is_default === true}
                      onChange={() => update(i, 'is_default', true)}
                      className="h-4 w-4 accent-brand-primary"
                    />
                    <span className="min-w-0 truncate text-xs leading-[14px] text-gray-600" title={selectLabel}>
                      {selectLabel}
                    </span>
                  </label>
                </SkuField>

                <SkuField label="Tồn kho">
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={sku.sku_stock ?? 0}
                    onChange={(e) => update(i, 'sku_stock', Number(e.target.value))}
                    className={inputCls()}
                  />
                </SkuField>

                <SkuField label="Giá bán">
                  <VndInput
                    value={sku.sku_price}
                    onChange={(n) => update(i, 'sku_price', n)}
                    placeholder="Giá tiền"
                  />
                </SkuField>

                <SkuField label="Giá khuyến mãi (nếu có)" sentenceLabel>
                  <VndInput
                    value={sku.sku_price_sale}
                    onChange={(n) => update(i, 'sku_price_sale', n)}
                    placeholder="Giá khuyến mãi"
                    sale
                  />
                </SkuField>
              </div>

              {isOpen && (
                <div className="mt-2 space-y-2 border-t border-gray-100 pt-2">
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-brand-gray/50 p-2.5">
                    <p className="mb-1.5 text-xs font-semibold text-gray-600">Ảnh biến thể</p>
                    <SkuImageList
                      images={sku.sku_images ?? []}
                      onChange={(urls) => update(i, 'sku_images', urls)}
                    />
                  </div>
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-brand-gray/50 p-2.5">
                    <p className="mb-1.5 text-xs font-semibold text-gray-600">Video biến thể</p>
                    <SkuVideoList
                      videos={sku.sku_videos ?? []}
                      onChange={(urls) => update(i, 'sku_videos', urls)}
                    />
                  </div>
                  <div
                    className={cn(
                      'min-w-0 rounded-lg border bg-brand-gray/50 p-2.5',
                      recipeError ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200',
                    )}
                  >
                    <p className="mb-1 text-xs font-semibold text-gray-600">
                      Nguyên liệu cần dùng
                      <span className="ml-0.5 text-red-500">*</span>
                    </p>
                    <SkuRecipeEditor
                      recipe={sku.sku_recipe ?? []}
                      onChange={(recipe) => update(i, 'sku_recipe', recipe)}
                      error={recipeError}
                    />
                  </div>
                </div>
              )}
            </article>
            </div>
          );
        })}
    </div>
      )}
    </div>
  );
}

/** @param {{ label: string, hint?: string, sentenceLabel?: boolean, children: React.ReactNode }} props */
function SkuField({ label, hint, sentenceLabel = false, children }) {
  return (
    <div className="min-w-0 space-y-0.5">
      <span
        className={cn(
          'block leading-none text-[10px] font-semibold text-gray-700',
          sentenceLabel ? 'normal-case tracking-normal' : 'uppercase tracking-wide',
        )}
      >
        {label}
      </span>
      {hint && <p className="text-[11px] leading-tight text-gray-500">{hint}</p>}
      {children}
    </div>
  );
}

/** @param {{ value: number, onChange: (n: number) => void, placeholder?: string, sale?: boolean }} props */
function VndInput({ value, onChange, placeholder, sale = false }) {
  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={value ? formatVndInput(value) : ''}
        onChange={(e) => onChange(parseVndInput(e.target.value))}
        placeholder={placeholder}
        className={cn(
          inputCls('pr-11 text-right tabular-nums text-[14px] leading-[16px] font-semibold'),
          sale && value > 0 && 'border-rose-200 text-rose-600',
        )}
      />
      <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[10px] font-medium text-gray-400">
        VNĐ
      </span>
    </div>
  );
}

function inputCls(extra) {
  return cn(
    'h-9 w-full min-w-0 text-xs leading-[14px] text-brand-dark',
    'rounded-lg border border-gray-200 bg-white px-2 py-1.5 outline-none',
    'hover:border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 transition',
    extra,
  );
}
