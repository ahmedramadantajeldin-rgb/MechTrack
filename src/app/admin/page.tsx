import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  CheckSquare,
  FileText,
  Bell,
  Calendar,
  AlertTriangle,
  Clock,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { getDeadlineInfo } from '@/lib/deadline';
import type { Metadata } from 'next';
import { format, parseISO } from 'date-fns';
import { DeadlineBadge } from '@/components/deadline-badge';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

async function getAdminStats() {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const [subjects, tasks, materials, announcements, events] = await Promise.all([
    supabase.from('subjects').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('tasks').select('*, subject:subjects(name)').order('deadline', { ascending: true }).limit(50),
    supabase.from('materials').select('id', { count: 'exact', head: true }),
    supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('calendar_events').select('*, subject:subjects(name)').gte('event_date', today).order('event_date', { ascending: true }).limit(5),
  ]);

  const allTasks = tasks.data || [];
  const overdueTasks = allTasks.filter((t) => getDeadlineInfo(t.deadline).status === 'overdue');
  const todayTasks = allTasks.filter((t) => getDeadlineInfo(t.deadline).status === 'due-today');
  const upcomingTasks = allTasks.filter(
    (t) => ['upcoming', 'due-tomorrow'].includes(getDeadlineInfo(t.deadline).status)
  );

  return {
    subjectCount: subjects.count || 0,
    taskCount: allTasks.length,
    materialCount: materials.count || 0,
    announcementCount: announcements.count || 0,
    overdueTasks,
    todayTasks,
    upcomingTasks,
    events: events.data || [],
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const quickActions = [
    { href: '/admin/subjects/new', label: 'Add Subject', icon: BookOpen },
    { href: '/admin/tasks/new', label: 'Add Task', icon: CheckSquare },
    { href: '/admin/materials/new', label: 'Upload Material', icon: FileText },
    { href: '/admin/announcements/new', label: 'New Announcement', icon: Bell },
    { href: '/admin/calendar/new', label: 'Add Event', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Mechanical Engineering Portal — MUST</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary/60" />
              <div>
                <p className="text-2xl font-bold">{stats.subjectCount}</p>
                <p className="text-xs text-muted-foreground">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-blue-500/60" />
              <div>
                <p className="text-2xl font-bold">{stats.taskCount}</p>
                <p className="text-xs text-muted-foreground">Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-500/60" />
              <div>
                <p className="text-2xl font-bold">{stats.materialCount}</p>
                <p className="text-xs text-muted-foreground">Materials</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-yellow-500/60" />
              <div>
                <p className="text-2xl font-bold">{stats.announcementCount}</p>
                <p className="text-xs text-muted-foreground">Announcements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deadline Alerts */}
      {(stats.overdueTasks.length > 0 || stats.todayTasks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.overdueTasks.length > 0 && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  {stats.overdueTasks.length} Overdue Task{stats.overdueTasks.length !== 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.overdueTasks.slice(0, 3).map((task) => (
                  <Link key={task.id} href={`/admin/tasks/${task.id}/edit`}>
                    <div className="flex items-center justify-between py-1.5 hover:bg-muted/50 px-2 rounded-md transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        {task.subject && (
                          <p className="text-xs text-muted-foreground">{task.subject.name}</p>
                        )}
                      </div>
                      <DeadlineBadge deadline={task.deadline} size="sm" />
                    </div>
                  </Link>
                ))}
                {stats.overdueTasks.length > 3 && (
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/admin/tasks">View all overdue tasks</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {stats.todayTasks.length > 0 && (
            <Card className="border-orange-200 dark:border-orange-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Clock className="h-4 w-4" />
                  {stats.todayTasks.length} Due Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.todayTasks.map((task) => (
                  <Link key={task.id} href={`/admin/tasks/${task.id}/edit`}>
                    <div className="flex items-center justify-between py-1.5 hover:bg-muted/50 px-2 rounded-md transition-colors">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <DeadlineBadge deadline={task.deadline} size="sm" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button key={action.href} variant="outline" asChild className="h-auto py-3 px-4 flex-col gap-1">
                <Link href={action.href}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{action.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      {stats.events.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Upcoming Events
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/calendar">Manage <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.events.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <div className="text-center w-10 shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(event.event_date), 'MMM')}
                  </p>
                  <p className="text-lg font-bold leading-none">
                    {format(parseISO(event.event_date), 'd')}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  {event.subject && (
                    <p className="text-xs text-muted-foreground">{event.subject.name}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
