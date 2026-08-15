'use client';

import { useState } from 'react';
import { cn } from '@/lib/shared/utils';

/**
 * Tab nội dung trang detail — không đổi URL, dùng cho staff/customer.
 *
 * @param {{
 *   tabs: Array<{ key: string, label: string, badge?: React.ReactNode, content: React.ReactNode }>,
 *   defaultTab?: string,
 *   className?: string,
 * }} props
 */
export default function DetailContentTabs({ tabs, defaultTab, className }) {
  const firstKey = tabs[0]?.key ?? '';
  const [active, setActive] = useState(defaultTab ?? firstKey);
  const current = tabs.find((tab) => tab.key === active) ?? tabs[0];

  if (!tabs.length) return null;

  return (
    <div className={cn('overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      <div
        className="flex gap-0 overflow-x-auto border-b border-gray-200 bg-brand-gray/40 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'border-brand-primary bg-white text-brand-primary'
                  : 'border-transparent text-gray-500 hover:bg-white/70 hover:text-brand-dark',
              )}
            >
              <span>{tab.label}</span>
              {tab.badge}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="p-0">
        {current?.content}
      </div>
    </div>
  );
}
