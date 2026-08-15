/**
 * Design system admin — wrapper trên shadcn/ui (components/ui/).
 * Feature/page import từ đây, không import trực tiếp ui/*.
 */
export {
  AdminButton,
  AdminButtonOutline,
  AdminButtonGhost,
  ADMIN_TOUCH_CLASS,
  ADMIN_COMPACT_CLASS,
} from '@/components/admin/AdminButton';

export {
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  adminControlClass,
} from '@/components/admin/AdminField';

export { FormCard, FormCollapsibleCard } from '@/components/admin/FormCard';

export { FormPublishToggle } from '@/components/admin/FormPublishToggle';

export {
  FormStickyActions,
  FormSubmitButton,
  FormSubmitButtonOutline,
} from '@/components/admin/FormStickyActions';

export { PageHeader, PageHeaderAction } from '@/components/admin/PageHeader';

export { PageBackHeader } from '@/components/admin/PageBackHeader';

export { PageBackButton } from '@/components/admin/PageBackButton';

export { StatPill } from '@/components/admin/StatPill';

export { StatusFilterTabs } from '@/components/admin/StatusFilterTabs';

export { ListFilterPanel, ListFilterRow, ListFilterSearchGroup, ListFilterField } from '@/components/admin/ListFilterPanel';

export {
  LIST_FILTER_INPUT_CLASS,
  LIST_FILTER_SELECT_CLASS,
  LIST_FILTER_BTN_CLASS,
  LIST_FILTER_GHOST_CLASS,
} from '@/components/admin/listFilterStyles';

export { AdminPlusIcon } from '@/components/admin/icons';

export { AdminErrorState } from '@/components/admin/AdminErrorState';
export { default as LiveDataRefresh } from '@/components/admin/LiveDataRefresh';
