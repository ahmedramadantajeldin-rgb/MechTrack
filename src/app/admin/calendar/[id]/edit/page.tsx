import { createClient } from '@/lib/supabase/server';
import { CalendarEventForm } from '@/components/admin/calendar-event-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Calendar Event' };

export default async function EditCalendarEventPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: event }, { data: subjects }] = await Promise.all([
    supabase.from('calendar_events').select('*').eq('id', params.id).single(),
    supabase.from('subjects').select('id, name').eq('is_active', true).order('display_order'),
  ]);
  if (!event) notFound();
  return (
    <div className="max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/admin/calendar" className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Back</Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <CalendarEventForm event={event} subjects={subjects || []} />
    </div>
  );
}
