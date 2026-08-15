'use client';

import { useEffect, useState } from 'react';
import { loadVariationPresets } from '@/lib/products/variationPresets';
import {
  applyVariationDisplayModeChange,
  ensureVariationDisplayModes,
  getDefaultVariationDisplayMode,
  normalizeDisplayModeValue,
  VARIATION_DISPLAY_OPTIONS,
} from '@/lib/products/variationDisplay';
import { cn } from '@/lib/shared/utils';

/**
 * Variation Editor — quản lý danh sách variations và options.
 * Gợi ý tên/options từ lần tạo sản phẩm trước (localStorage).
 *
 * @param {{
 *   variations: Array<{ name: string, options: string[], colors?: string[], display_mode?: string }>,
 *   onChange: (variations: typeof variations) => void,
 * }} props
 */
export default function VariationEditor({ variations, onChange }) {
  const [presets, setPresets] = useState(null);

  useEffect(() => {
    setPresets(loadVariationPresets());
  }, []);

  function addVariation(initial = { name: '', options: [], colors: [] }) {
    if (variations.length >= 3) return;
    const next = [
      ...variations,
      {
        ...initial,
        display_mode: getDefaultVariationDisplayMode(variations.length, variations.length + 1),
      },
    ];
    onChange(ensureVariationDisplayModes(next));
  }

  function removeVariation(index) {
    onChange(ensureVariationDisplayModes(variations.filter((_, i) => i !== index)));
  }

  function updateVariation(index, updates) {
    const updated = [...variations];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  }

  function addOption(varIndex, value) {
    const val = value.trim();
    if (!val) return;
    const opts = variations[varIndex].options ?? [];
    if (opts.includes(val)) return;
    updateVariation(varIndex, { options: [...opts, val] });
  }

  function removeOption(varIndex, optIndex) {
    const opts = [...(variations[varIndex].options ?? [])].filter((_, i) => i !== optIndex);
    updateVariation(varIndex, { options: opts });
  }

  function applyTemplate(template) {
    if (variations.length >= 3) return;
    addVariation({
      name: template.name,
      options: [...(template.options ?? [])],
      colors: [],
    });
  }

  function updateDisplayMode(index, mode) {
    onChange(applyVariationDisplayModeChange(variations, index, mode));
  }

  const nameSuggestions = presets?.recentNames ?? [];
  const templates = presets?.templates ?? [];

  return (
    <div className="space-y-3">
      {templates.length > 0 && (
        <div className="rounded-xl border border-brand-primary/15 bg-brand-primary/5 p-3 space-y-2">
          <p className="text-xs font-semibold text-brand-primary">Gợi ý từ lần trước</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <button
                key={`${tpl.name}-${tpl.options?.join('-')}`}
                type="button"
                disabled={variations.length >= 3}
                onClick={() => applyTemplate(tpl)}
                className={cn(
                  'rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-left text-xs',
                  'hover:border-brand-primary hover:text-brand-primary transition-colors',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
              >
                <span className="font-semibold text-brand-dark">{tpl.name}</span>
                <span className="mt-0.5 block text-[10px] text-gray-400 truncate max-w-[200px]">
                  {(tpl.options ?? []).join(' · ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={cn(
          'grid gap-2',
          variations.length >= 2 && 'md:grid-cols-2',
        )}
      >
        {variations.map((variation, i) => (
          <div
            key={i}
            className={cn(variations.length === 3 && i === 2 && 'md:col-span-2')}
          >
            <VariationRow
              index={i}
              variation={variation}
              variationCount={variations.length}
              nameSuggestions={nameSuggestions}
              optionSuggestions={presets?.recentOptions?.[variation.name?.trim()] ?? []}
              onNameChange={(name) => updateVariation(i, { name })}
              onAddOption={(val) => addOption(i, val)}
              onRemoveOption={(optIdx) => removeOption(i, optIdx)}
              onRemove={() => removeVariation(i)}
              onDisplayModeChange={(mode) => updateDisplayMode(i, mode)}
            />
          </div>
        ))}
      </div>

      {variations.length < 3 && (
        <button
          type="button"
          onClick={() => addVariation()}
          className="flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-[#2d5e30] transition-colors"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </span>
          Thêm loại phân loại {variations.length === 0 ? '' : `(${variations.length}/3)`}
        </button>
      )}

      {variations.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
          Chưa có phân loại — click &quot;+ Thêm&quot; hoặc chọn gợi ý phía trên
        </p>
      )}
    </div>
  );
}

function VariationRow({
  index,
  variation,
  variationCount,
  nameSuggestions,
  optionSuggestions,
  onNameChange,
  onAddOption,
  onRemoveOption,
  onRemove,
  onDisplayModeChange,
}) {
  const [optInput, setOptInput] = useState('');
  const listId = `variation-name-${index}`;
  const displayMode = normalizeDisplayModeValue(
    variation.display_mode ?? getDefaultVariationDisplayMode(index, variationCount),
  );

  function handleAddOpt(val) {
    const v = (val ?? optInput).trim();
    if (!v) return;
    onAddOption(v);
    setOptInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); handleAddOpt(); }
  }

  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-brand-gray/50 p-2 md:p-2.5 space-y-2">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white">
          {index + 1}
        </span>
        {variationCount >= 2 && (
          <select
            value={displayMode}
            onChange={(e) => onDisplayModeChange(e.target.value)}
            aria-label="Cách hiển thị trên card cửa hàng"
            className={cn(
              'h-8 shrink-0 rounded-lg border bg-white px-2 text-[10px] font-semibold uppercase tracking-wide outline-none transition',
              displayMode === 'overlay'
                ? 'border-brand-primary text-brand-primary focus:ring-2 focus:ring-brand-primary/20'
                : 'border-gray-200 text-gray-600 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15',
            )}
          >
            {VARIATION_DISPLAY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          list={nameSuggestions.length ? listId : undefined}
          value={variation.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Tên nhóm (VD: Khối lượng, Hương vị…)"
          className="h-8 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 transition"
        />
        {nameSuggestions.length > 0 && (
          <datalist id={listId}>
            {nameSuggestions.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Xóa variation"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {optionSuggestions.length > 0 && (
          <>
            <span className="shrink-0 text-[10px] text-gray-400">Gợi ý:</span>
            {optionSuggestions.map((opt) => {
              const added = variation.options?.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={added}
                  onClick={() => handleAddOpt(opt)}
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors',
                    added
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-default'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-brand-primary hover:text-brand-primary',
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </>
        )}

        {(variation.options ?? []).map((opt, optIdx) => (
          <span
            key={optIdx}
            className="flex min-w-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-brand-dark"
          >
            {opt}
            <button
              type="button"
              onClick={() => onRemoveOption(optIdx)}
              className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors"
              aria-label={`Xóa option ${opt}`}
            >
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        <div className="flex items-center gap-1">
          <input
            type="text"
            value={optInput}
            onChange={(e) => setOptInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Thêm option..."
            className="h-7 w-full max-w-[140px] rounded-lg border border-dashed border-gray-300 bg-white px-2 text-xs outline-none focus:border-brand-primary transition sm:w-28"
          />
          <button
            type="button"
            onClick={() => handleAddOpt()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-primary text-white hover:bg-[#2d5e30] transition-colors"
            aria-label="Thêm option"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {variation.options?.length === 0 && (
        <p className="text-xs leading-tight text-gray-400">
          Nhập option rồi nhấn <kbd className="rounded border border-gray-200 bg-white px-1 font-mono text-[10px]">Enter</kbd> hoặc click gợi ý
        </p>
      )}
    </div>
  );
}
