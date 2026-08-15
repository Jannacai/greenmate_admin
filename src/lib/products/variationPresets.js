/**
 * Lưu / gợi ý phân loại hàng từ localStorage (theo shop admin).
 */

const STORAGE_KEY = 'greenmate_admin_variation_presets';

const EMPTY = {
  templates: [],
  recentNames: [],
  recentOptions: {},
};

/**
 * @returns {typeof EMPTY}
 */
export function loadVariationPresets() {
  if (typeof window === 'undefined') return { ...EMPTY };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return {
      templates: Array.isArray(parsed.templates) ? parsed.templates : [],
      recentNames: Array.isArray(parsed.recentNames) ? parsed.recentNames : [],
      recentOptions: parsed.recentOptions && typeof parsed.recentOptions === 'object'
        ? parsed.recentOptions
        : {},
    };
  } catch {
    return { ...EMPTY };
  }
}

/**
 * @param {typeof EMPTY} presets
 */
function saveVariationPresets(presets) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

/**
 * Lưu variations sau khi tạo sản phẩm thành công.
 * @param {Array<{ name: string, options: string[] }>} variations
 */
export function saveVariationPresetsFromProduct(variations) {
  const valid = (variations ?? []).filter(
    (v) => v?.name?.trim() && Array.isArray(v.options) && v.options.length > 0,
  );
  if (!valid.length) return;

  const presets = loadVariationPresets();

  for (const v of valid) {
    const name = v.name.trim();
    if (!presets.recentNames.includes(name)) {
      presets.recentNames.unshift(name);
    }
    const opts = v.options.filter(Boolean);
    const existing = new Set(presets.recentOptions[name] ?? []);
    for (const o of opts) existing.add(o);
    presets.recentOptions[name] = [...existing].slice(0, 20);
  }
  presets.recentNames = presets.recentNames.slice(0, 10);

  const templateKey = (t) => `${t.name}::${(t.options ?? []).join('|')}`;
  const seen = new Set(presets.templates.map(templateKey));

  for (const v of valid) {
    const entry = { name: v.name.trim(), options: v.options.filter(Boolean) };
    const key = templateKey(entry);
    if (!seen.has(key)) {
      presets.templates.unshift(entry);
      seen.add(key);
    }
  }
  presets.templates = presets.templates.slice(0, 8);

  saveVariationPresets(presets);
}
