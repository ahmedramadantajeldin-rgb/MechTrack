import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { TaskCard } from '@/components/task-card';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  BookOpen,
  Bell,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDeadlineInfo } from '@/lib/deadline';
import { format, parseISO } from 'date-fns';
import { getGreeting } from '@/lib/utils';

async function getDashboardData() {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const [tasksResult, materialsResult, announcementsResult, eventsResult] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('*, subject:subjects(id, name, code, color)')
        .order('deadline', { ascending: true })
        .limit(20),
      supabase
        .from('materials')
        .select('*, subject:subjects(id, name, code)')
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('announcements')
        .select('*, subject:subjects(id, name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('calendar_events')
        .select('*, subject:subjects(id, name)')
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(5),
    ]);

  const tasks = tasksResult.data || [];
  const materials = materialsResult.data || [];
  const announcements = announcementsResult.data || [];
  const events = eventsResult.data || [];

  const overdue = tasks.filter((t) => getDeadlineInfo(t.deadline).status === 'overdue');
  const dueToday = tasks.filter((t) => getDeadlineInfo(t.deadline).status === 'due-today');
  const upcoming = tasks.filter(
    (t) =>
      getDeadlineInfo(t.deadline).status === 'upcoming' ||
      getDeadlineInfo(t.deadline).status === 'due-tomorrow'
  );

  return { tasks, materials, announcements, events, overdue, dueToday, upcoming };
}

export default async function DashboardPage() {
  const { tasks, materials, announcements, events, overdue, dueToday, upcoming } =
    await getDashboardData();

  const greeting = getGreeting();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {greeting}, Mechanical Engineers 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Faculty of Engineering — Mechanical Engineering Department, MUST
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdue.length}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-orange-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dueToday.length}</p>
                <p className="text-xs text-muted-foreground">Due Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{upcoming.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Tasks */}
          {overdue.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Overdue
                </h2>
              </div>
              <div className="grid gap-3">
                {overdue.slice(0, 3).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

          {/* Due Today */}
          {dueToday.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Due Today
                </h2>
              </div>
              <div className="grid gap-3">
                {dueToday.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Tasks */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tasks" className="flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            {upcoming.length === 0 && overdue.length === 0 && dueToday.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="All clear!"
                description="No upcoming tasks at the moment."
              />
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming tasks.</p>
            ) : (
              <div className="grid gap-3">
                {upcoming.slice(0, 5).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Announcements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No announcements.</p>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="border-l-2 border-primary pl-3">
                    <p className="text-sm font-medium line-clamp-2">{ann.title}</p>
                    {ann.subject && (
                      <p className="text-xs text-muted-foreground mt-0.5">{ann.subject.name}</p>
                    )}
                  </div>
                ))
              )}
              <Button variant="ghost" size="sm" asChild className="w-full mt-2">
                <Link href="/announcements" className="flex items-center gap-1">
                  All announcements <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Calendar Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events.</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-10 text-center">
                      <p className="text-xs font-bold text-primary">
                        {format(parseISO(event.event_date), 'MMM')}
                      </p>
                      <p className="text-lg font-bold leading-none">
                        {format(parseISO(event.event_date), 'd')}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{event.title}</p>
                      {event.subject && (
                        <p className="text-xs text-muted-foreground">{event.subject.name}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              <Button variant="ghost" size="sm" asChild className="w-full mt-2">
                <Link href="/calendar" className="flex items-center gap-1">
                  Full calendar <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Materials */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Recent Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {materials.length === 0 ? (
                <p className="text-sm text-muted-foreground">No materials yet.</p>
              ) : (
                materials.map((mat) => (
                  <div key={mat.id} className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs shrink-0 uppercase">
                      {mat.type.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm line-clamp-2">{mat.title}</p>
                  </div>
                ))
              )}
              <Button variant="ghost" size="sm" asChild className="w-full mt-2">
                <Link href="/materials" className="flex items-center gap-1">
                  All materials <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
