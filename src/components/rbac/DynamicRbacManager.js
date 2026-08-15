'use client';

import dynamic from 'next/dynamic';

const RbacManager = dynamic(() => import('@/components/rbac/RbacManager'), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-11 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
    </div>
  ),
  ssr: false,
});

/** @param {import('@/components/rbac/RbacManager').default extends React.ComponentType<infer P> ? P : never} props */
export default function DynamicRbacManager(props) {
  return <RbacManager {...props} />;
}
