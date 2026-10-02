import {
  differenceInDays,
  isToday,
  isTomorrow,
  isPast,
  parseISO,
  startOfDay,
} from 'date-fns';

export type DeadlineStatus =
  | 'no-deadline'
  | 'overdue'
  | 'due-today'
  | 'due-tomorrow'
  | 'upcoming';

export interface DeadlineInfo {
  status: DeadlineStatus;
  label: string;
  daysLeft: number | null;
  colorClass: string;
  badgeClass: string;
}

export function getDeadlineInfo(deadline: string | null | undefined): DeadlineInfo {
  if (!deadline) {
    return {
      status: 'no-deadline',
      label: 'No deadline',
      daysLeft: null,
      colorClass: 'text-muted-foreground',
      badgeClass: 'bg-muted text-muted-foreground',
    };
  }

  const deadlineDate = startOfDay(parseISO(deadline));
  const today = startOfDay(new Date());
  const daysLeft = differenceInDays(deadlineDate, today);

  if (isPast(deadlineDate) && !isToday(deadlineDate)) {
    return {
      status: 'overdue',
      label: 'Overdue',
      daysLeft,
      colorClass: 'text-red-600 dark:text-red-400',
      badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
  }

  if (isToday(deadlineDate)) {
    return {
      status: 'due-today',
      label: 'Due Today',
      daysLeft: 0,
      colorClass: 'text-orange-600 dark:text-orange-400',
      badgeClass:
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
  }

  if (isTomorrow(deadlineDate)) {
    return {
      status: 'due-tomorrow',
      label: 'Due Tomorrow',
      daysLeft: 1,
      colorClass: 'text-yellow-600 dark:text-yellow-400',
      badgeClass:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
  }

  return {
    status: 'upcoming',
    label: daysLeft === 1 ? '1 Day Left' : `${daysLeft} Days Left`,
    daysLeft,
    colorClass:
      daysLeft <= 7
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-muted-foreground',
    badgeClass:
      daysLeft <= 7
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        : 'bg-muted text-muted-foreground',
  };
}

export function isOverdue(deadline: string | null | undefined): boolean {
  return getDeadlineInfo(deadline).status === 'overdue';
}

export function isDueToday(deadline: string | null | undefined): boolean {
  return getDeadlineInfo(deadline).status === 'due-today';
}

export function isDueSoon(deadline: string | null | undefined, days = 7): boolean {
  const info = getDeadlineInfo(deadline);
  return (
    info.status !== 'overdue' &&
    info.daysLeft !== null &&
    info.daysLeft <= days
  );
}
