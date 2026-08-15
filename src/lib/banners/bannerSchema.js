import { z } from 'zod';

export {
  BANNER_DESKTOP_IMAGE,
  BANNER_MOBILE_IMAGE,
  BANNER_DESKTOP_ASPECT_CLASS,
  BANNER_MOBILE_ASPECT_CLASS,
  CATEGORY_STRIP_DESKTOP_IMAGE,
  CATEGORY_STRIP_MOBILE_IMAGE,
  CATEGORY_STRIP_DESKTOP_ASPECT_CLASS,
  CATEGORY_STRIP_MOBILE_ASPECT_CLASS,
} from '@/lib/banners/bannerImageSpecs';

export const BANNER_KINDS = ['hero_slider', 'category_strip'];

export const BANNER_KIND_LABELS = {
  hero_slider: 'Hero slider (đầu trang)',
  category_strip: 'Banner danh mục (strip CTA)',
};

export const HERO_PLACEMENTS = ['home_hero', 'hat_hero', 'sua_hero'];

/** Giữ export cũ — gồm category_strip cho filter admin */
export const BANNER_PLACEMENTS = [...HERO_PLACEMENTS, 'category_strip'];

export const BANNER_PLACEMENT_LABELS = {
  home_hero: 'Trang chủ — Hero slider',
  hat_hero: 'Hạt dinh dưỡng — Hero slider',
  sua_hero: 'Sữa hạt organic — Hero slider',
  category_strip: 'Banner danh mục — strip',
};

/**
 * @param {object} banner
 */
export function getBannerLifecycleStatus(banner) {
  return banner?.banner_is_active ? 'active' : 'inactive';
}

export const bannerSchema = z
  .object({
    kind: z.enum(BANNER_KINDS).default('hero_slider'),
    title: z.string().max(120).optional().default(''),
    placement: z.string().optional().default('home_hero'),
    category_id: z.string().optional().default(''),
    desktop_url: z
      .string()
      .trim()
      .min(1, 'Chưa tải ảnh')
      .refine((v) => /^https?:\/\/.+/i.test(v), {
        message: 'URL ảnh phải bắt đầu bằng http:// hoặc https://',
      }),
    mobile_url: z
      .string()
      .trim()
      .min(1, 'Chưa tải ảnh')
      .refine((v) => /^https?:\/\/.+/i.test(v), {
        message: 'URL ảnh phải bắt đầu bằng http:// hoặc https://',
      }),
    link: z
      .string()
      .trim()
      .optional()
      .default('')
      .refine((v) => !v || v.startsWith('/') || /^https?:\/\/.+/i.test(v), {
        message: 'Link phải là đường dẫn nội bộ (/) hoặc URL http(s)',
      }),
    sort_order: z.coerce.number().int().min(0).max(9999).default(0),
    is_active: z.coerce.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.kind === 'hero_slider') {
      if (!HERO_PLACEMENTS.includes(data.placement)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Chọn vị trí hero slider',
          path: ['placement'],
        });
      }
      return;
    }

    if (!data.category_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Chọn danh mục (cấp 1 hoặc cấp 2)',
        path: ['category_id'],
      });
    }
  });

/**
 * @param {z.SafeParseReturnType<any, any>} result
 */
export function formatBannerSchemaError(result) {
  if (result.success) return null;

  /** @type {Record<string, string[]>} */
  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) {
      fieldErrors[key] = [issue.message];
    }
  }
  return { fieldErrors };
}

/**
 * @param {import('zod').infer<typeof bannerSchema>} data
 */
export function toBannerApiBody(data) {
  const body = {
    kind: data.kind,
    title: data.title ?? '',
    desktop_url: data.desktop_url,
    mobile_url: data.mobile_url,
    link: data.link ?? '',
    sort_order: data.sort_order ?? 0,
    is_active: data.is_active ?? false,
  };

  if (data.kind === 'category_strip') {
    body.category_id = data.category_id?.trim() ?? '';
    body.placement = 'category_strip';
  } else {
    body.placement = data.placement;
  }

  return body;
}
