'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { sanitizeUrl, detectUrlType } from '@/lib/url-validator';

const materialSchema = z.object({
  subject_id: z.string().uuid().nullable().optional(),
  title: z.string().min(2).max(200),
  description: z.string().max(1000).nullable().optional(),
  type: z.enum(['pdf', 'image', 'document', 'presentation', 'spreadsheet', 'youtube', 'google_drive', 'external_link']),
  external_url: z.string().nullable().optional(),
  display_order: z.coerce.number().int().min(0).default(0),
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

export async function createMaterial(formData: FormData) {
  const { supabase } = await verifyAdmin();

  const rawUrl = formData.get('external_url') as string;
  const sanitizedUrl = rawUrl ? sanitizeUrl(rawUrl) : null;
  let type = formData.get('type') as string;

  // Auto-detect type from URL if not provided
  if (sanitizedUrl && (!type || type === 'external_link')) {
    const detected = detectUrlType(sanitizedUrl);
    if (detected === 'youtube') type = 'youtube';
    else if (detected === 'google_drive') type = 'google_drive';
    else if (detected === 'external') type = 'external_link';
  }

  const raw = {
    subject_id: (formData.get('subject_id') as string) || null,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    type: type || 'external_link',
    external_url: sanitizedUrl,
    display_order: (formData.get('display_order') as string) || '0',
  };

  const validated = materialSchema.parse(raw);
  const { error } = await supabase.from('materials').insert({
    ...validated,
    file_url: null,
    file_name: null,
    file_size: null,
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/materials');
  revalidatePath('/materials');
  redirect('/admin/materials');
}

export async function updateMaterial(id: string, formData: FormData) {
  const { supabase } = await verifyAdmin();

  const rawUrl = formData.get('external_url') as string;
  const sanitizedUrl = rawUrl ? sanitizeUrl(rawUrl) : null;
  let type = formData.get('type') as string;

  if (sanitizedUrl && (!type || type === 'external_link')) {
    const detected = detectUrlType(sanitizedUrl);
    if (detected === 'youtube') type = 'youtube';
    else if (detected === 'google_drive') type = 'google_drive';
    else if (detected === 'external') type = 'external_link';
  }

  const raw = {
    subject_id: (formData.get('subject_id') as string) || null,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    type: type || 'external_link',
    external_url: sanitizedUrl,
    display_order: (formData.get('display_order') as string) || '0',
  };

  const validated = materialSchema.parse(raw);
  const { error } = await supabase.from('materials').update(validated).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/materials');
  revalidatePath('/materials');
  redirect('/admin/materials');
}

export async function deleteMaterial(id: string) {
  const { supabase } = await verifyAdmin();

  // Delete file from storage if exists
  const { data: material } = await supabase
    .from('materials')
    .select('file_url')
    .eq('id', id)
    .single();

  if (material?.file_url) {
    const urlParts = material.file_url.split('/storage/v1/object/public/materials/');
    if (urlParts[1]) {
      await supabase.storage.from('materials').remove([urlParts[1]]);
    }
  }

  const { error } = await supabase.from('materials').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/materials');
  revalidatePath('/materials');
  return { success: true };
}

export async function uploadMaterialFile(materialId: string, file: File, userId: string) {
  const { supabase } = await verifyAdmin();
  const { validateFile, getSafeFilename, ALLOWED_MIME_TYPES } = await import('@/lib/file-validator');

  const validation = validateFile(file);
  if (!validation.valid) return { error: validation.error };

  const safeName = getSafeFilename(file.name, userId);
  const path = `materials/${materialId}/${safeName}`;

  const { data, error } = await supabase.storage
    .from('materials')
    .upload(path, file, { upsert: true });

  if (error) return { error: error.message };

  const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(data.path);

  // Determine material type from MIME type
  const mimeToType: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/png': 'image',
    'image/jpeg': 'image',
    'image/webp': 'image',
    'image/gif': 'image',
    'application/msword': 'document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
    'application/vnd.ms-powerpoint': 'presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
    'application/vnd.ms-excel': 'spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  };
  const materialType = mimeToType[file.type] || 'document';

  const { error: updateError } = await supabase
    .from('materials')
    .update({
      file_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      type: materialType,
    })
    .eq('id', materialId);

  if (updateError) return { error: updateError.message };

  revalidatePath(`/materials`);
  return { success: true, url: publicUrl };
}
