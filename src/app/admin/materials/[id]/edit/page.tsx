import { createClient } from '@/lib/supabase/server';
import { MaterialForm } from '@/components/admin/material-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Material' };

export default async function EditMaterialPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: material }, { data: subjects }] = await Promise.all([
    supabase.from('materials').select('*').eq('id', params.id).single(),
    supabase.from('subjects').select('id, name').eq('is_active', true).order('display_order'),
  ]);

  if (!material) notFound();

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/admin/materials" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Materials
        </Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">Edit Material</h1>
      <MaterialForm material={material} subjects={subjects || []} />
    </div>
  );
}
