'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { sanitizeUrl } from '@/lib/url-validator';

const taskSchema = z.object({
  subject_id: z.string().uuid().nullable().optional(),
  type: z.enum(['assignment', 'quiz', 'sheet', 'project', 'exam']),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).nullable().optional(),
  deadline: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).default('pending'),
  external_url: z.string().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
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

export async function createTask(formData: FormData) {
  const { supabase } = await verifyAdmin();

  const rawExternalUrl = formData.get('external_url') as string;
  const sanitizedUrl = rawExternalUrl ? sanitizeUrl(rawExternalUrl) : null;

  const raw = {
    subject_id: (formData.get('subject_id') as string) || null,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    deadline: (formData.get('deadline') as string) || null,
    priority: formData.get('priority') as string || 'medium',
    status: formData.get('status') as string || 'pending',
    external_url: sanitizedUrl,
    notes: (formData.get('notes') as string) || null,
    attachment_url: null,
    attachment_name: null,
  };

  const validated = taskSchema.parse(raw);

  const { error } = await supabase.from('tasks').insert({
    ...validated,
    attachment_url: raw.attachment_url,
    attachment_name: raw.attachment_name,
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/tasks');
  revalidatePath('/tasks');
  revalidatePath('/');
  redirect('/admin/tasks');
}

export async function updateTask(id: string, formData: FormData) {
  const { supabase } = await verifyAdmin();

  const rawExternalUrl = formData.get('external_url') as string;
  const sanitizedUrl = rawExternalUrl ? sanitizeUrl(rawExternalUrl) : null;

  const raw = {
    subject_id: (formData.get('subject_id') as string) || null,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    deadline: (formData.get('deadline') as string) || null,
    priority: formData.get('priority') as string || 'medium',
    status: formData.get('status') as string || 'pending',
    external_url: sanitizedUrl,
    notes: (formData.get('notes') as string) || null,
  };

  const validated = taskSchema.parse(raw);
  const { error } = await supabase.from('tasks').update(validated).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/tasks');
  revalidatePath(`/tasks/${id}`);
  revalidatePath('/tasks');
  revalidatePath('/');
  redirect('/admin/tasks');
}

export async function deleteTask(id: string) {
  const { supabase } = await verifyAdmin();

  // Also delete the attachment from storage if exists
  const { data: task } = await supabase
    .from('tasks')
    .select('attachment_url')
    .eq('id', id)
    .single();

  if (task?.attachment_url) {
    // Extract storage path from URL
    const urlParts = task.attachment_url.split('/storage/v1/object/public/task-attachments/');
    if (urlParts[1]) {
      await supabase.storage.from('task-attachments').remove([urlParts[1]]);
    }
  }

  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/tasks');
  revalidatePath('/tasks');
  revalidatePath('/');
  return { success: true };
}

export async function uploadTaskAttachment(taskId: string, file: File, userId: string) {
  const { supabase } = await verifyAdmin();
  const { getSafeFilename } = await import('@/lib/file-validator');
  const { validateFile } = await import('@/lib/file-validator');

  const validation = validateFile(file);
  if (!validation.valid) return { error: validation.error };

  const safeName = getSafeFilename(file.name, userId);
  const path = `tasks/${taskId}/${safeName}`;

  const { data, error } = await supabase.storage
    .from('task-attachments')
    .upload(path, file, { upsert: true });

  if (error) return { error: error.message };

  const { data: { publicUrl } } = supabase.storage
    .from('task-attachments')
    .getPublicUrl(data.path);

  const { error: updateError } = await supabase
    .from('tasks')
    .update({ attachment_url: publicUrl, attachment_name: file.name })
    .eq('id', taskId);

  if (updateError) return { error: updateError.message };

  revalidatePath(`/tasks/${taskId}`);
  return { success: true, url: publicUrl };
}
