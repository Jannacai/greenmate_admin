/**
 * Theme sản phẩm theo trạng thái — dùng chung list card, badge, chi tiết.
 * @param {'published' | 'draft'} status
 */
export function getProductCardTheme(status) {
  const themes = {
    published: {
      border: 'border-green-400/85',
      bg: 'bg-gradient-to-br from-green-100/95 via-green-50/70 to-white',
      hoverBorder: 'hover:border-green-500',
    },
    draft: {
      border: 'border-gray-200',
      bg: 'bg-gradient-to-br from-gray-50/80 via-white to-white',
      hoverBorder: 'hover:border-gray-300',
    },
  };

  return themes[status] ?? themes.draft;
}

/**
 * @param {'published' | 'draft'} status
 */
export function getProductStatusBadgeTheme(status) {
  const themes = {
    published: {
      label: 'Đang bán',
      dot: 'bg-green-600',
      className: 'bg-green-100 text-green-900 ring-green-300',
    },
    draft: {
      label: 'Nháp',
      dot: 'bg-amber-500',
      className: 'bg-amber-50 text-amber-900 ring-amber-200',
    },
  };

  return themes[status] ?? themes.draft;
}

/**
 * Theme thanh tóm tắt trang chi tiết / xem trước SP.
 * @param {'published' | 'draft'} status
 */
export function getProductDetailSummaryTheme(status) {
  const card = getProductCardTheme(status);

  if (status === 'published') {
    return {
      ...card,
      divide: 'divide-green-100/90',
      sectionBorder: 'border-green-100/90',
    };
  }

  return {
    ...card,
    divide: 'divide-gray-100',
    sectionBorder: 'border-gray-100',
  };
}
