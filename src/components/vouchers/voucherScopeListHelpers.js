/** @param {{ productCode?: string | null }} row */
export function scopeProductCopyValue(row) {
  return row.productCode ?? '';
}

/** @param {{ skuCode?: string | null }} item */
export function scopeSkuCopyValue(item) {
  return item.skuCode ?? '';
}

export function scopeProductCopyLabel() {
  return 'Mã sản phẩm';
}

export function scopeSkuCopyLabel() {
  return 'Mã SKU';
}

/** @param {object} row */
export function getRowSkuPriceLines(row) {
  if (row.variants?.length) {
    return row.variants.map((variant) => ({
      skuId: variant.skuId,
      skuCode: variant.skuCode,
      label: variant.variantLabel,
      price: variant.price,
      priceAmount: variant.priceAmount ?? 0,
      originalPrice: variant.originalPrice ?? null,
    }));
  }
  return row.skuPriceLines ?? [];
}
