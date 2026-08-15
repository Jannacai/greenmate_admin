import AppToaster from '@/components/common/AppToaster';

/**
 * Layout cho nhóm (auth) — không sidebar, có Sonner toast.
 */
export default function AuthLayout({ children }) {
  return (
    <>
      <AppToaster />
      {children}
    </>
  );
}
