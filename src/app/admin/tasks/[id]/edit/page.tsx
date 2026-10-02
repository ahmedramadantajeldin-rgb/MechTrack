import { createClient } from '@/lib/supabase/server';
import { TaskForm } from '@/components/admin/task-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Task' };

export default async function EditTaskPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: task }, { data: subjects }] = await Promise.all([
    supabase.from('tasks').select('*').eq('id', params.id).single(),
    supabase.from('subjects').select('id, name').eq('is_active', true).order('display_order'),
  ]);

  if (!task) notFound();

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/admin/tasks" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Tasks
        </Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">Edit Task</h1>
      <TaskForm task={task} subjects={subjects || []} />
    </div>
  );
}
