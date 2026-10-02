import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format, parseISO, isToday, isFuture, isPast, startOfToday } from 'date-fns';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Academic Calendar',
  description: 'Upcoming academic events, exams, and important dates',
};

const eventTypeConfig: Record<string, { label: string; color: string; badgeClass: string }> = {
  exam: { label: 'Exam', color: 'border-l-red-500', badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  quiz: { label: 'Quiz', color: 'border-l-purple-500', badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  assignment_deadline: { label: 'Assignment', color: 'border-l-blue-500', badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  project_deadline: { label: 'Project', color: 'border-l-orange-500', badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  lecture: { label: 'Lecture', color: 'border-l-green-500', badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  general: { label: 'Event', color: 'border-l-slate-400', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

async function getEvents() {
  const supabase = createClient();
  const today = startOfToday().toISOString().split('T')[0];
  const { data } = await supabase
    .from('calendar_events')
    .select('*, subject:subjects(id, name)')
    .gte('event_date', today)
    .order('event_date', { ascending: true });
  return data || [];
}

async function getPastEvents() {
  const supabase = createClient();
  const today = startOfToday().toISOString().split('T')[0];
  const { data } = await supabase
    .from('calendar_events')
    .select('*, subject:subjects(id, name)')
    .lt('event_date', today)
    .order('event_date', { ascending: false })
    .limit(10);
  return data || [];
}

export default async function CalendarPage() {
  const [events, pastEvents] = await Promise.all([getEvents(), getPastEvents()]);

  const groupedEvents = events.reduce(
    (acc, event) => {
      const monthYear = format(parseISO(event.event_date), 'MMMM yyyy');
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(event);
      return acc;
    },
    {} as Record<string, typeof events>
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Academic Calendar</h1>
        <p className="text-muted-foreground">Upcoming exams, quizzes, and important dates</p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No upcoming events"
          description="The academic calendar is empty. Check back soon for upcoming events."
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
            <section key={monthYear}>
              <h2 className="text-lg font-semibold mb-4 text-primary">{monthYear}</h2>
              <div className="space-y-3">
                {monthEvents.map((event) => {
                  const config = eventTypeConfig[event.type] || eventTypeConfig.general;
                  const eventDate = parseISO(event.event_date);
                  const isEventToday = isToday(eventDate);
                  return (
                    <Card
                      key={event.id}
                      className={cn(
                        'border-l-4 transition-colors',
                        config.color,
                        isEventToday && 'bg-primary/5'
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 text-center w-12">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              {format(eventDate, 'EEE')}
                            </p>
                            <p className="text-2xl font-bold leading-tight">
                              {format(eventDate, 'd')}
                            </p>
                            {isEventToday && (
                              <span className="text-xs font-semibold text-primary">Today</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${config.badgeClass}`}>
                                {config.label}
                              </span>
                              {event.subject && (
                                <span className="text-xs text-muted-foreground">
                                  {event.subject.name}
                                </span>
                              )}
                            </div>
                            <p className="font-semibold">{event.title}</p>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            )}
                            {event.event_time && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {event.event_time}
                              </p>
                            )}
                            {event.location && (
                              <p className="text-xs text-muted-foreground mt-1">
                                📍 {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Past Events</h2>
          <div className="space-y-2">
            {pastEvents.map((event) => {
              const config = eventTypeConfig[event.type] || eventTypeConfig.general;
              return (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-md bg-muted/50 opacity-60">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${config.badgeClass}`}>
                    {config.label}
                  </span>
                  <span className="text-sm font-medium">{event.title}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {format(parseISO(event.event_date), 'MMM d, yyyy')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
