import { cn } from '@/lib/shared/utils';

export const VOUCHER_STRIP_HEIGHT_CLASS = 'h-[20px] lg:h-[40px]';
export const VOUCHER_STRIP_MOBILE_BOTTOM_CLASS = 'bottom-[20px]';
export const VOUCHER_PILL_HEIGHT_CLASS = 'h-[16px] lg:h-[26px]';

const voucherStripArtSvgProps = {
  className: 'absolute inset-0 h-full w-full pointer-events-none',
  preserveAspectRatio: 'none',
  viewBox: '0 0 300 40',
  'aria-hidden': true,
};

const VOUCHER_STRIP_RIGHT_WING = (
  <path
    d="M300,40 H290 Q274,34 278,24 Q276,12 287,0 H300 Z"
    className="fill-teal-400"
  />
);

function VoucherStripArtBackground({ previewMode }) {
  const forceMobile = previewMode === 'mobile';
  const forceDesktop = previewMode === 'desktop';

  if (forceMobile) {
    return (
      <svg {...voucherStripArtSvgProps}>
        <path d="M0,0 H44 Q60,20 44,40 H0 Z" className="fill-emerald-500" />
        {VOUCHER_STRIP_RIGHT_WING}
        <path
          d="M44,0 H287 Q279,11 281,20 Q283,29 290,40 H44 Q32,20 44,0 Z"
          className="fill-brand-primary"
        />
      </svg>
    );
  }

  if (forceDesktop) {
    return (
      <svg {...voucherStripArtSvgProps}>
        <path d="M0,0 H76 Q102,20 76,40 H0 Z" className="fill-emerald-500" />
        {VOUCHER_STRIP_RIGHT_WING}
        <path
          d="M76,0 H287 Q279,11 281,20 Q283,29 290,40 H76 Q50,20 76,0 Z"
          className="fill-brand-primary"
        />
      </svg>
    );
  }

  return (
    <>
      <svg {...voucherStripArtSvgProps} className={cn(voucherStripArtSvgProps.className, 'lg:hidden')}>
        <path d="M0,0 H44 Q60,20 44,40 H0 Z" className="fill-emerald-500" />
        {VOUCHER_STRIP_RIGHT_WING}
        <path
          d="M44,0 H287 Q279,11 281,20 Q283,29 290,40 H44 Q32,20 44,0 Z"
          className="fill-brand-primary"
        />
      </svg>
      <svg {...voucherStripArtSvgProps} className={cn(voucherStripArtSvgProps.className, 'hidden lg:block')}>
        <path d="M0,0 H76 Q102,20 76,40 H0 Z" className="fill-emerald-500" />
        {VOUCHER_STRIP_RIGHT_WING}
        <path
          d="M76,0 H287 Q279,11 281,20 Q283,29 290,40 H76 Q50,20 76,0 Z"
          className="fill-brand-primary"
        />
      </svg>
    </>
  );
}

function stripHeightClass(previewMode, compact) {
  if (previewMode === 'mobile') return compact ? 'h-[20px]' : 'h-[20px]';
  if (previewMode === 'desktop') return compact ? 'h-[40px]' : 'h-[40px]';
  return compact ? 'h-[20px] lg:h-[40px]' : VOUCHER_STRIP_HEIGHT_CLASS;
}

/**
 * Strip voucher ProductCard — port từ greenmate_fe ProductVoucherStrip.js
 *
 * @param {{
 *   voucher?: { code?: string, text?: string } | null,
 *   hidden?: boolean,
 *   compact?: boolean,
 *   previewMode?: 'mobile' | 'desktop',
 *   className?: string,
 * }} props
 */
export default function StorefrontProductVoucherStrip({
  voucher,
  hidden = false,
  compact = false,
  previewMode,
  className,
}) {
  if (!voucher) return null;

  const isCode = Boolean(voucher.code);
  const code = voucher.code?.trim() || '';
  const title = voucher.text?.trim() || '';

  if (!isCode && !title) return null;

  const mobile = previewMode === 'mobile';
  const desktop = previewMode === 'desktop';

  const hintSz = compact
    ? 'text-[8px]'
    : mobile
      ? 'text-[7px]'
      : desktop
        ? 'text-[9px]'
        : 'text-[7px] lg:text-[9px]';

  const codeSz = compact
    ? 'text-[10px]'
    : mobile
      ? 'text-[10px]'
      : desktop
        ? 'text-[12px]'
        : 'text-[10px] lg:text-[12px]';

  const codeTextClass = desktop
    ? 'block w-full min-w-0 whitespace-nowrap font-bold uppercase leading-none tracking-wide text-white'
    : 'w-full min-w-0 truncate font-bold uppercase leading-none tracking-wide text-white';

  const pillTextSz = compact
    ? 'text-[9px]'
    : mobile
      ? 'text-[9px]'
      : desktop
        ? 'text-[14px]'
        : 'text-[9px] lg:text-[14px]';

  const pillH = mobile
    ? 'h-[16px]'
    : desktop
      ? 'h-[26px]'
      : VOUCHER_PILL_HEIGHT_CLASS;

  const pillClass = cn(
    pillH,
    'relative z-10 inline-flex max-w-full shrink-0 items-center justify-center rounded-full bg-white',
    mobile
      ? 'w-fit px-2'
      : desktop
        ? 'min-w-0 w-auto flex-1 px-2'
        : 'w-fit px-2 lg:min-w-0 lg:w-auto lg:flex-1',
    pillTextSz,
    'font-bold uppercase leading-none text-brand-primary truncate text-center whitespace-nowrap',
  );

  const stripShellClass = cn(
    'absolute bottom-0 inset-x-0 z-10 overflow-hidden',
    stripHeightClass(previewMode, compact),
    'transition-opacity duration-200',
    hidden ? 'opacity-0 pointer-events-none' : 'opacity-100',
    className,
  );

  const stripContentClass = cn(
    'relative z-10 flex h-full w-full items-center',
    mobile
      ? 'px-1.5 gap-1'
      : desktop
        ? 'px-3 gap-2'
        : compact
          ? 'px-1.5 gap-1'
          : 'px-1.5 gap-1 lg:px-3 lg:gap-2',
  );

  const codeBlockClass = mobile
    ? 'hidden'
    : desktop
      ? 'flex min-w-0 w-[34%] max-w-[34%] shrink-0 flex-col justify-center leading-none pr-0.5'
      : 'hidden lg:flex min-w-0 w-[34%] max-w-[34%] shrink-0 flex-col justify-center leading-none pr-0.5';

  const dividerClass = mobile
    ? 'hidden'
    : desktop
      ? 'block w-px shrink-0 self-stretch bg-white/30'
      : 'hidden lg:block w-px shrink-0 self-stretch bg-white/30';

  if (!isCode) {
    return (
      <div className={stripShellClass}>
        <VoucherStripArtBackground previewMode={previewMode} />
        <div className={cn(stripContentClass, 'justify-center')}>
          <span
            className={cn(
              pillTextSz,
              'w-full min-w-0 truncate text-center font-bold uppercase leading-none tracking-wide text-white px-1',
            )}
            title={title}
          >
            {title}
          </span>
        </div>
      </div>
    );
  }

  if (!title) {
    const shell = cn(stripShellClass, mobile ? 'hidden' : desktop ? 'block' : 'hidden lg:block');
    return (
      <div className={shell}>
        <VoucherStripArtBackground previewMode={previewMode} />
        <div className={stripContentClass}>
          <div className="flex min-w-0 w-full shrink-0 flex-col justify-center leading-none">
            <span className={cn(hintSz, 'mb-0.5 block font-normal uppercase tracking-wide text-white/70')}>
              nhập mã
            </span>
            <span className={cn(codeSz, codeTextClass)} title={code}>
              {code}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={stripShellClass}>
      <VoucherStripArtBackground previewMode={previewMode} />
      <div className={cn(stripContentClass, mobile || !desktop ? 'justify-center' : 'justify-start')}>
        <div className={codeBlockClass}>
          <span className={cn(hintSz, 'mb-0.5 block font-normal uppercase tracking-wide text-white/70')}>
            nhập mã
          </span>
          <span className={cn(codeSz, codeTextClass)} title={code}>
            {code}
          </span>
        </div>

        <span className={dividerClass} aria-hidden="true" />
        <span className={pillClass} title={title}>
          {title}
        </span>
      </div>
    </div>
  );
}
