import { createClient } from '@/lib/supabase/server';
import { CalendarEventForm } from '@/components/admin/calendar-event-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Add Calendar Event' };

export default async function NewCalendarEventPage() {
  const supabase = createClient();
  const { data: subjects } = await supabase.from('subjects').select('id, name').eq('is_active', true).order('display_order');
  return (
    <div className="max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/admin/calendar" className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Back</Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">Add Calendar Event</h1>
      <CalendarEventForm subjects={subjects || []} />
    </div>
  );
}
