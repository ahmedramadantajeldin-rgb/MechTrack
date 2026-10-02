import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Pencil, Calendar } from 'lucide-react';
import Link from 'next/link';
import { DeleteCalendarEventButton } from '@/components/admin/delete-calendar-event-button';
import { format, parseISO } from 'date-fns';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Calendar' };

const eventTypeColors: Record<string, string> = {
  exam: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  quiz: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  assignment_deadline: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  project_deadline: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  lecture: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  general: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default async function AdminCalendarPage() {
  const supabase = createClient();
  const { data: events } = await supabase
    .from('calendar_events')
    .select('*, subject:subjects(name)')
    .order('event_date', { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar Events</h1>
          <p className="text-muted-foreground">{events?.length || 0} total events</p>
        </div>
        <Button asChild>
          <Link href="/admin/calendar/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Event
          </Link>
        </Button>
      </div>

      {!events?.length ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No events yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="text-center w-12 shrink-0">
                    <p className="text-xs text-muted-foreground">{format(parseISO(event.event_date), 'MMM')}</p>
                    <p className="text-xl font-bold leading-tight">{format(parseISO(event.event_date), 'd')}</p>
                    <p className="text-xs text-muted-foreground">{format(parseISO(event.event_date), 'yyyy')}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${eventTypeColors[event.type] || ''}`}>
                        {event.type.replace('_', ' ')}
                      </span>
                      {event.subject && <span className="text-xs text-muted-foreground">{event.subject.name}</span>}
                    </div>
                    <p className="font-semibold">{event.title}</p>
                    {event.description && <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{event.description}</p>}
                    {event.event_time && <p className="text-xs text-muted-foreground">{event.event_time}</p>}
                    {event.location && <p className="text-xs text-muted-foreground">📍 {event.location}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" asChild aria-label="Edit event">
                      <Link href={`/admin/calendar/${event.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <DeleteCalendarEventButton id={event.id} title={event.title} />
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
