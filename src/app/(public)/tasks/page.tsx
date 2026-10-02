import { createClient } from '@/lib/supabase/server';
import { TaskCard } from '@/components/task-card';
import { EmptyState } from '@/components/empty-state';
import { CheckSquare } from 'lucide-react';
import { TaskFilters } from '@/components/task-filters';
import type { Metadata } from 'next';
import type { TaskType } from '@/types/database';

export const metadata: Metadata = {
  title: 'Tasks',
  description: 'View all academic tasks, assignments, quizzes, and exams',
};

interface PageProps {
  searchParams: { type?: string; subject?: string; status?: string };
}

async function getTasks(searchParams: PageProps['searchParams']) {
  const supabase = createClient();
  let query = supabase
    .from('tasks')
    .select('*, subject:subjects(id, name, code, color)')
    .order('deadline', { ascending: true });

  if (searchParams.type && searchParams.type !== 'all') {
    query = query.eq('type', searchParams.type as TaskType);
  }
  if (searchParams.subject) {
    query = query.eq('subject_id', searchParams.subject);
  }

  const { data } = await query;
  return data || [];
}

async function getSubjects() {
  const supabase = createClient();
  const { data } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('is_active', true)
    .order('display_order');
  return data || [];
}

export default async function TasksPage({ searchParams }: PageProps) {
  const [tasks, subjects] = await Promise.all([
    getTasks(searchParams),
    getSubjects(),
  ]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-muted-foreground">All assignments, quizzes, sheets, projects, and exams</p>
      </div>

      <TaskFilters subjects={subjects} />

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="No tasks match your current filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
