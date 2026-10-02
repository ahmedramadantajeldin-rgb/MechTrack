import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { TaskCard } from '@/components/task-card';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckSquare, FileText, Bell } from 'lucide-react';
import type { Metadata } from 'next';
import { format, parseISO } from 'date-fns';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from('subjects')
    .select('name, code')
    .eq('id', params.id)
    .single();
  if (!data) return { title: 'Subject Not Found' };
  return { title: data.name, description: `${data.code} - ${data.name}` };
}

async function getSubjectData(id: string) {
  const supabase = createClient();

  const [subjectResult, tasksResult, materialsResult, announcementsResult] =
    await Promise.all([
      supabase.from('subjects').select('*').eq('id', id).single(),
      supabase
        .from('tasks')
        .select('*, subject:subjects(id, name, code, color)')
        .eq('subject_id', id)
        .order('deadline', { ascending: true })
        .limit(20),
      supabase
        .from('materials')
        .select('*')
        .eq('subject_id', id)
        .order('display_order', { ascending: true }),
      supabase
        .from('announcements')
        .select('*')
        .eq('subject_id', id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

  return {
    subject: subjectResult.data,
    tasks: tasksResult.data || [],
    materials: materialsResult.data || [],
    announcements: announcementsResult.data || [],
  };
}

const materialTypeLabels: Record<string, string> = {
  pdf: 'PDF',
  image: 'Image',
  document: 'Document',
  presentation: 'Presentation',
  spreadsheet: 'Spreadsheet',
  youtube: 'YouTube',
  google_drive: 'Google Drive',
  external_link: 'Link',
};

export default async function SubjectPage({ params }: PageProps) {
  const { subject, tasks, materials, announcements } = await getSubjectData(params.id);

  if (!subject) notFound();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      {/* Subject Header */}
      <div className="mb-8">
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold text-lg mb-4"
          style={{ backgroundColor: subject.color || '#003087' }}
        >
          {subject.code.substring(0, 2)}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{subject.name}</h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="outline">{subject.code}</Badge>
          {subject.instructor && (
            <Badge variant="secondary">Dr. {subject.instructor}</Badge>
          )}
          {subject.semester && <Badge variant="secondary">{subject.semester}</Badge>}
          {subject.academic_year && (
            <Badge variant="secondary">{subject.academic_year}</Badge>
          )}
        </div>
        {subject.description && (
          <p className="text-muted-foreground mt-3 max-w-2xl">{subject.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks */}
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckSquare className="h-5 w-5" /> Tasks ({tasks.length})
            </h2>
            {tasks.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No tasks"
                description="No tasks assigned for this subject yet."
              />
            ) : (
              <div className="grid gap-3">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {/* Materials */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Materials ({materials.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {materials.length === 0 ? (
                <p className="text-sm text-muted-foreground">No materials yet.</p>
              ) : (
                materials.map((mat) => (
                  <a
                    key={mat.id}
                    href={mat.file_url || mat.external_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <Badge variant="outline" className="text-xs shrink-0">
                      {materialTypeLabels[mat.type] || mat.type}
                    </Badge>
                    <span className="text-sm line-clamp-1">{mat.title}</span>
                  </a>
                ))
              )}
            </CardContent>
          </Card>

          {/* Announcements */}
          {announcements.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" /> Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="border-l-2 border-primary pl-3">
                    <p className="text-sm font-medium">{ann.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {ann.body}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
