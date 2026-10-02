'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const subjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  code: z.string().min(2, 'Code must be at least 2 characters').max(20),
  description: z.string().max(500).optional().nullable(),
  instructor: z.string().max(100).optional().nullable(),
  semester: z.string().max(50).optional().nullable(),
  academic_year: z.string().max(20).optional().nullable(),
  display_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  color: z.string().max(20).optional().nullable(),
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

export async function createSubject(formData: FormData) {
  const { supabase } = await verifyAdmin();

  const raw = {
    name: formData.get('name') as string,
    code: formData.get('code') as string,
    description: formData.get('description') as string || null,
    instructor: formData.get('instructor') as string || null,
    semester: formData.get('semester') as string || null,
    academic_year: formData.get('academic_year') as string || null,
    display_order: formData.get('display_order') as string || '0',
    is_active: formData.get('is_active') === 'true',
    color: formData.get('color') as string || '#003087',
  };

  const validated = subjectSchema.parse(raw);
  const { error } = await supabase.from('subjects').insert(validated);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/subjects');
  revalidatePath('/subjects');
  redirect('/admin/subjects');
}

export async function updateSubject(id: string, formData: FormData) {
  const { supabase } = await verifyAdmin();

  const raw = {
    name: formData.get('name') as string,
    code: formData.get('code') as string,
    description: formData.get('description') as string || null,
    instructor: formData.get('instructor') as string || null,
    semester: formData.get('semester') as string || null,
    academic_year: formData.get('academic_year') as string || null,
    display_order: formData.get('display_order') as string || '0',
    is_active: formData.get('is_active') === 'true',
    color: formData.get('color') as string || '#003087',
  };

  const validated = subjectSchema.parse(raw);
  const { error } = await supabase.from('subjects').update(validated).eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/subjects');
  revalidatePath(`/subjects/${id}`);
  revalidatePath('/subjects');
  redirect('/admin/subjects');
}

export async function deleteSubject(id: string) {
  const { supabase } = await verifyAdmin();
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/subjects');
  revalidatePath('/subjects');
  return { success: true };
}

export async function toggleSubjectActive(id: string, isActive: boolean) {
  const { supabase } = await verifyAdmin();
  const { error } = await supabase
    .from('subjects')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/subjects');
  revalidatePath('/subjects');
  return { success: true };
}
