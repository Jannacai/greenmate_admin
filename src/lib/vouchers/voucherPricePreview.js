/**
 * Ước lượng giá SKU sau voucher — dùng preview admin, không phụ thuộc productPreview.
 *
 * @param {number} priceAmount
 * @param {object} [discount]
 * @returns {{ after: number, savings: number }}
 */
export function applyVoucherToSkuPrice(priceAmount, discount) {
  const price = Math.max(0, Number(priceAmount) || 0);
  if (!discount || price <= 0) return { after: price, savings: 0 };

  const value = Number(discount.discount_value ?? 0);
  if (value <= 0) return { after: price, savings: 0 };

  let savings = 0;
  if (discount.discount_type === 'percentage') {
    savings = Math.round(price * value / 100);
  } else {
    savings = Math.min(price, value);
  }

  return {
    after: Math.max(0, price - savings),
    savings,
  };
}
