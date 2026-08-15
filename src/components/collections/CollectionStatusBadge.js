import { cn } from '@/lib/shared/utils';
import { COLLECTION_STATUS_CONFIG, getCollectionStatusKey } from '@/lib/collections/collectionDisplay';

/**
 * @param {{
 *   collection: object,
 *   className?: string,
 *   showDot?: boolean,
 *   dense?: boolean,
 *   plain?: boolean,
 * }} props
 */
export default function CollectionStatusBadge({
  collection,
  className,
  showDot = true,
  dense = false,
  plain = false,
}) {
  const status = getCollectionStatusKey(collection);
  const config = COLLECTION_STATUS_CONFIG[status] ?? COLLECTION_STATUS_CONFIG.inactive;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold',
        plain
          ? cn('text-[10px] md:text-xs', config.text)
          : cn(
            'rounded-full px-2.5 py-0.5 ring-1',
            dense ? 'text-[13px]' : 'text-[10px] md:text-xs',
            config.className,
          ),
        className,
      )}
    >
      {showDot && (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dot)} aria-hidden />
      )}
      {config.label}
    </span>
  );
}
