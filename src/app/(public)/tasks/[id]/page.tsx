import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { DeadlineBadge } from '@/components/deadline-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  BookOpen,
  Download,
  ExternalLink,
  ArrowLeft,
  FileText,
  Flag,
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import type { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase.from('tasks').select('title').eq('id', params.id).single();
  if (!data) return { title: 'Task Not Found' };
  return { title: data.title };
}

const taskTypeColors: Record<string, string> = {
  assignment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  quiz: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  sheet: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  project: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  exam: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const priorityColors: Record<string, string> = {
  low: 'secondary',
  medium: 'warning',
  high: 'warning',
  urgent: 'danger',
};

export default async function TaskDetailPage({ params }: PageProps) {
  const supabase = createClient();
  const { data: task } = await supabase
    .from('tasks')
    .select('*, subject:subjects(id, name, code, color)')
    .eq('id', params.id)
    .single();

  if (!task) notFound();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/tasks" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Tasks
        </Link>
      </Button>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${taskTypeColors[task.type] || ''}`}
          >
            {task.type}
          </span>
          <DeadlineBadge deadline={task.deadline} />
          <Badge variant={(priorityColors[task.priority] as 'secondary' | 'warning' | 'danger') || 'secondary'}>
            {task.priority} priority
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{task.title}</h1>
        {task.subject && (
          <Link
            href={`/subjects/${task.subject.id}`}
            className="flex items-center gap-1.5 mt-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span className="text-sm">{task.subject.name}</span>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {task.description && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{task.description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {task.deadline && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="text-sm font-medium">
                    {format(parseISO(task.deadline), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Flag className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Priority</p>
                <p className="text-sm font-medium capitalize">{task.priority}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium capitalize">{task.type}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {(task.attachment_url || task.external_url) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {task.attachment_url && (
                <Button asChild className="w-full sm:w-auto">
                  <a
                    href={task.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download{task.attachment_name ? ` ${task.attachment_name}` : ' Attachment'}
                  </a>
                </Button>
              )}
              {task.external_url && (
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <a
                    href={task.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open External Link
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {task.notes && (
          <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-wrap">
                {task.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
