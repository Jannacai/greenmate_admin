'use client';

import { Toaster } from 'sonner';

/**
 * Toaster toàn cục — Sonner, gắn một lần trong dashboard shell.
 */
export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      richColors
      expand={false}
      duration={5000}
      toastOptions={{
        classNames: {
          toast: 'font-sans shadow-lg border border-gray-200',
          title: 'text-brand-dark font-semibold',
          description: 'text-gray-600',
        },
      }}
    />
  );
}
