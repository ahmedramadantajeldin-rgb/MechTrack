'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const announcementSchema = z.object({
  subject_id: z.string().uuid().nullable().optional(),
  title: z.string().min(2).max(200),
  body: z.string().min(5).max(5000),
  priority: z.enum(['normal', 'important', 'urgent']).default('normal'),
  is_published: z.boolean().default(false),
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

export async function createAnnouncement(formData: FormData) {
  const { supabase } = await verifyAdmin();

  const isPublished = formData.get('is_published') === 'true';
  const raw = {
    subject_id: (formData.get('subject_id') as string) || null,
    title: formData.get('title') as string,
    body: formData.get('body') as string,
    priority: formData.get('priority') as string || 'normal',
    is_published: isPublished,
  };

  const validated = announcementSchema.parse(raw);
  const { error } = await supabase.from('announcements').insert({
    ...validated,
    published_at: isPublished ? new Date().toISOString() : null,
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/announcements');
  revalidatePath('/announcements');
  revalidatePath('/');
  redirect('/admin/announcements');
}

export async function updateAnnouncement(id: string, formData: FormData) {
  const { supabase } = await verifyAdmin();

  const isPublished = formData.get('is_published') === 'true';
  const raw = {
    subject_id: (formData.get('subject_id') as string) || null,
    title: formData.get('title') as string,
    body: formData.get('body') as string,
    priority: formData.get('priority') as string || 'normal',
    is_published: isPublished,
  };

  const validated = announcementSchema.parse(raw);

  // Only update published_at if publishing for first time
  const { data: existing } = await supabase
    .from('announcements')
    .select('published_at, is_published')
    .eq('id', id)
    .single();

  const publishedAt =
    isPublished && !existing?.is_published
      ? new Date().toISOString()
      : existing?.published_at;

  const { error } = await supabase
    .from('announcements')
    .update({ ...validated, published_at: publishedAt })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/announcements');
  revalidatePath('/announcements');
  revalidatePath('/');
  redirect('/admin/announcements');
}

export async function deleteAnnouncement(id: string) {
  const { supabase } = await verifyAdmin();
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/announcements');
  revalidatePath('/announcements');
  revalidatePath('/');
  return { success: true };
}

export async function toggleAnnouncementPublished(id: string, isPublished: boolean) {
  const { supabase } = await verifyAdmin();
  const { error } = await supabase
    .from('announcements')
    .update({
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/announcements');
  revalidatePath('/announcements');
  revalidatePath('/');
  return { success: true };
}
