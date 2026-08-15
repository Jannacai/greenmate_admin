/**
 * Theme card voucher theo lifecycle (đồng bộ backend `lifecycle_status`).
 * @param {'active'|'inactive'|'expired'|'scheduled'} lifecycle
 */
export function getVoucherCardTheme(lifecycle) {
  const themes = {
    active: {
      border: 'border-green-400/85',
      bg: 'bg-gradient-to-br from-green-100/95 via-green-50/70 to-white',
      header: 'bg-green-100/60',
      tear: 'border-green-400/90',
      tearDash: 'border-green-400/75',
      hoverBorder: 'hover:border-green-500',
    },
    scheduled: {
      border: 'border-blue-200/90',
      bg: 'bg-gradient-to-br from-blue-50/70 via-white to-white',
      header: 'bg-blue-50/35',
      tear: 'border-blue-200/90',
      tearDash: 'border-blue-200/65',
      hoverBorder: 'hover:border-blue-300',
    },
    inactive: {
      border: 'border-gray-300',
      bg: 'bg-gradient-to-br from-gray-100/90 via-brand-gray/50 to-white',
      header: 'bg-gray-100/55',
      tear: 'border-gray-300',
      tearDash: 'border-gray-300/75',
      hoverBorder: 'hover:border-gray-400',
    },
    expired: {
      border: 'border-rose-300/90',
      bg: 'bg-gradient-to-br from-rose-100/85 via-rose-50/60 to-white',
      header: 'bg-rose-100/55',
      tear: 'border-rose-300/90',
      tearDash: 'border-rose-300/70',
      hoverBorder: 'hover:border-rose-400',
    },
  };

  return themes[lifecycle] ?? themes.inactive;
}
