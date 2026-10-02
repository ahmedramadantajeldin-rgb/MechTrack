import { createClient } from '@/lib/supabase/server';
import { SubjectForm } from '@/components/admin/subject-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Subject' };

export default async function EditSubjectPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!subject) notFound();

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/admin/subjects" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Subjects
        </Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">Edit Subject</h1>
      <SubjectForm subject={subject} />
    </div>
  );
}
