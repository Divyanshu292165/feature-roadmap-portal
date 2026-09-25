import type * as React from 'react';
import { Badge as CossBadge } from './coss/badge';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'status_under_review'
    | 'status_planned'
    | 'status_in_progress'
    | 'status_completed'
    | 'cat_ui_ux'
    | 'cat_integrations'
    | 'cat_performance'
    | 'cat_general';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
  status_under_review: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  status_planned: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  status_in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  status_completed: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  cat_ui_ux: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  cat_integrations: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  cat_performance: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  cat_general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

function Badge({ className, variant = 'default', ...props }: BadgeProps): React.ReactElement {
  return (
    <CossBadge
      size="lg"
      className={cn(
        'rounded-full border-transparent px-2.5 py-0.5 font-semibold',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
