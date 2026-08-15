import { getRoleTypeLabel, getRoleTypeTextClass } from '@/lib/rbac/rbacConstants';
import { cn } from '@/lib/shared/utils';

/**
 * @param {{ roleType?: string, roleName?: string }} props
 */
export default function StaffRoleBadge({ roleType = 'STAFF', roleName }) {
  const label = roleName || getRoleTypeLabel(roleType);

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center truncate text-[10px] font-semibold md:text-xs',
        getRoleTypeTextClass(roleType),
      )}
      title={label}
    >
      {label}
    </span>
  );
}
