import { createClient } from '@/lib/supabase/server';
import { TaskForm } from '@/components/admin/task-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Add Task' };

export default async function NewTaskPage() {
  const supabase = createClient();
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('is_active', true)
    .order('display_order');

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/admin/tasks" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Tasks
        </Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">Add New Task</h1>
      <TaskForm subjects={subjects || []} />
    </div>
  );
}
