'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bannerSchema } from '@/lib/banners/bannerSchema';
import { createBannerAction, updateBannerAction } from '@/lib/actions/banner';
import { showError, showSuccess } from '@/lib/shared/toast';

/**
 * Hook form banner dùng chung — hero slider và banner danh mục.
 * @param {{
 *   mode: 'create' | 'edit',
 *   kind: 'hero_slider' | 'category_strip',
 *   bannerId?: string,
 *   initial?: object | null,
 *   cancelHref?: string,
 *   defaultPlacement?: string,
 *   successLabels?: { create?: string, update?: string },
 * }} options
 */
export function useBannerForm({
  mode,
  kind,
  bannerId,
  initial = null,
  cancelHref = '/banners',
  defaultPlacement = 'home_hero',
  successLabels = {},
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const actionFn =
    isEdit && bannerId
      ? updateBannerAction.bind(null, bannerId)
      : createBannerAction;

  const [state, formAction] = useActionState(actionFn, null);
  const [isPending, startTransition] = useTransition();
  const [desktopUrl, setDesktopUrl] = useState(initial?.banner_desktop_url ?? '');
  const [mobileUrl, setMobileUrl] = useState(initial?.banner_mobile_url ?? '');

  const form = useForm({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      kind,
      title: initial?.banner_title ?? '',
      placement:
        kind === 'category_strip'
          ? 'category_strip'
          : (initial?.banner_placement ?? defaultPlacement),
      category_id: initial?.banner_category_id ? String(initial.banner_category_id) : '',
      desktop_url: initial?.banner_desktop_url ?? '',
      mobile_url: initial?.banner_mobile_url ?? '',
      link: initial?.banner_link ?? '',
      sort_order: initial?.banner_sort_order ?? 0,
      is_active: initial?.banner_is_active ?? false,
    },
  });

  const { setValue, formState: { errors } } = form;
  const fieldDisabled = isPending;

  useEffect(() => {
    setValue('kind', kind);
  }, [kind, setValue]);

  useEffect(() => {
    setValue('desktop_url', desktopUrl, { shouldValidate: true });
  }, [desktopUrl, setValue]);

  useEffect(() => {
    setValue('mobile_url', mobileUrl, { shouldValidate: true });
  }, [mobileUrl, setValue]);

  useEffect(() => {
    if (state?.error) {
      const noun = kind === 'category_strip' ? 'banner danh mục' : 'slide hero';
      showError(`Không lưu được ${noun}`, state.error);
    }
  }, [state?.error, kind]);

  useEffect(() => {
    if (!state?.success) return;
    if (mode === 'create') {
      showSuccess(successLabels.create ?? 'Đã tạo banner');
      router.push(state.bannerId ? `/banners/${state.bannerId}` : '/banners');
      return;
    }
    showSuccess(successLabels.update ?? state.message ?? 'Đã cập nhật banner');
    router.push(bannerId ? `/banners/${bannerId}` : '/banners');
  }, [
    state?.success,
    state?.message,
    state?.bannerId,
    mode,
    bannerId,
    router,
    successLabels.create,
    successLabels.update,
  ]);

  function onSubmit(data) {
    const formData = new FormData();
    for (const [key, val] of Object.entries(data)) {
      if (key === 'is_active') {
        formData.set(key, val ? 'true' : 'false');
      } else {
        formData.set(key, String(val ?? ''));
      }
    }
    startTransition(() => formAction(formData));
  }

  const fieldError = (field) =>
    errors[field]?.message ?? state?.fieldErrors?.[field]?.[0];

  return {
    form,
    isEdit,
    isPending,
    fieldDisabled,
    desktopUrl,
    setDesktopUrl,
    mobileUrl,
    setMobileUrl,
    onSubmit,
    fieldError,
    cancelHref,
  };
}
