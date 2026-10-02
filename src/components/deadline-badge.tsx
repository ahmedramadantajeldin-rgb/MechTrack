import { getDeadlineInfo } from '@/lib/deadline';
import { cn } from '@/lib/utils';

interface DeadlineBadgeProps {
  deadline: string | null | undefined;
  className?: string;
  size?: 'sm' | 'md';
}

export function DeadlineBadge({ deadline, className, size = 'md' }: DeadlineBadgeProps) {
  const info = getDeadlineInfo(deadline);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs',
        info.badgeClass,
        className
      )}
    >
      {info.label}
    </span>
  );
}
