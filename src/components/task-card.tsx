import Link from 'next/link';
import { Calendar, BookOpen, Paperclip, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeadlineBadge } from '@/components/deadline-badge';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/database';
import { format, parseISO } from 'date-fns';

const taskTypeColors: Record<string, string> = {
  assignment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  quiz: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  sheet: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  project: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  exam: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface TaskCardProps {
  task: Task;
  className?: string;
}

export function TaskCard({ task, className }: TaskCardProps) {
  return (
    <Link href={`/tasks/${task.id}`}>
      <Card
        className={cn(
          'hover:shadow-md transition-shadow cursor-pointer',
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
                    taskTypeColors[task.type] || taskTypeColors.assignment
                  )}
                >
                  {task.type}
                </span>
                {task.priority !== 'low' && (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
                      priorityColors[task.priority]
                    )}
                  >
                    {task.priority}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                {task.title}
              </h3>
              {task.subject && (
                <div className="flex items-center gap-1 mt-1">
                  <BookOpen className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {task.subject.name}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <DeadlineBadge deadline={task.deadline} />
              {(task.attachment_url || task.external_url) && (
                <div className="flex gap-1">
                  {task.attachment_url && (
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                  )}
                  {task.external_url && (
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              )}
            </div>
          </div>
          {task.deadline && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {format(parseISO(task.deadline), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
