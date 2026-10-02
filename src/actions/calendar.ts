'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const calendarEventSchema = z.object({
  subject_id: z.string().uuid().nullable().optional(),
  title: z.string().min(2).max(200),
  description: z.string().max(1000).nullable().optional(),
  event_date: z.string().min(10, 'Event date is required'),
  event_time: z.string().nullable().optional(),
  type: z.enum(['exam', 'quiz', 'assignment_deadline', 'project_deadline', 'lecture', 'general']),
  location: z.string().max(200).nullable().optional(),
});

async function verifyAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') throw new Error('Forbidden');
  return { supabase, user };
}

export async function createCalendarEvent(formData: FormData) {
  const { supabase } = await verifyAdmin();

  const raw = {
    subject_id: (formData.get('subject_id') as string) || null,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    event_date: formData.get('event_date') as string,
    event_time: (formData.get('event_time') as string) || null,
    type: formData.get('type') as string,
    location: (formData.get('location') as string) || null,
  };

  const validated = calendarEventSchema.parse(raw);
  const { error } = await supabase.from('calendar_events').insert(validated);

  if (error) return { error: error.message };

  revalidatePath('/admin/calendar');
  revalidatePath('/calendar');
  revalidatePath('/');
  redirect('/admin/calendar');
}

export async function updateCalendarEvent(id: string, formData: FormData) {
  const { supabase } = await verifyAdmin();

  const raw = {
    subject_id: (formData.get('subject_id') as string) || null,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    event_date: formData.get('event_date') as string,
    event_time: (formData.get('event_time') as string) || null,
    type: formData.get('type') as string,
    location: (formData.get('location') as string) || null,
  };

  const validated = calendarEventSchema.parse(raw);
  const { error } = await supabase.from('calendar_events').update(validated).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/calendar');
  revalidatePath('/calendar');
  revalidatePath('/');
  redirect('/admin/calendar');
}

export async function deleteCalendarEvent(id: string) {
  const { supabase } = await verifyAdmin();
  const { error } = await supabase.from('calendar_events').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/calendar');
  revalidatePath('/calendar');
  revalidatePath('/');
  return { success: true };
}
