import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pencil, Calendar } from 'lucide-react';
import Link from 'next/link';
import { DeadlineBadge } from '@/components/deadline-badge';
import { DeleteTaskButton } from '@/components/admin/delete-task-button';
import { format, parseISO } from 'date-fns';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Tasks' };

const taskTypeColors: Record<string, string> = {
  assignment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  quiz: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  sheet: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  project: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  exam: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default async function AdminTasksPage() {
  const supabase = createClient();
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, subject:subjects(name)')
    .order('deadline', { ascending: true });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">{tasks?.length || 0} total tasks</p>
        </div>
        <Button asChild>
          <Link href="/admin/tasks/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
          </Link>
        </Button>
      </div>

      {!tasks?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tasks yet. Add your first task.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/tasks/new">Add Task</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${taskTypeColors[task.type] || ''}`}>
                        {task.type}
                      </span>
                      {task.subject && (
                        <Badge variant="outline" className="text-xs">{task.subject.name}</Badge>
                      )}
                      <DeadlineBadge deadline={task.deadline} size="sm" />
                    </div>
                    <p className="font-semibold">{task.title}</p>
                    {task.deadline && (
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(task.deadline), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" asChild aria-label="Edit task">
                      <Link href={`/admin/tasks/${task.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteTaskButton id={task.id} title={task.title} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
