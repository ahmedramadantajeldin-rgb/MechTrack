import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/empty-state';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subjects',
  description: 'Browse all Mechanical Engineering subjects and courses',
};

async function getSubjects() {
  const supabase = createClient();
  const { data } = await supabase
    .from('subjects')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  return data || [];
}

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <p className="text-muted-foreground">All active Mechanical Engineering subjects</p>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="Subjects will appear here once they are added by the administrator."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/subjects/${subject.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold text-sm mb-2"
                      style={{ backgroundColor: subject.color || '#003087' }}
                    >
                      {subject.code.substring(0, 2)}
                    </div>
                    <Badge variant="outline" className="text-xs">{subject.code}</Badge>
                  </div>
                  <CardTitle className="text-base">{subject.name}</CardTitle>
                  {subject.instructor && (
                    <CardDescription className="text-xs">
                      Dr. {subject.instructor}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  {subject.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {subject.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {subject.semester && (
                      <Badge variant="secondary" className="text-xs">
                        {subject.semester}
                      </Badge>
                    )}
                    {subject.academic_year && (
                      <Badge variant="secondary" className="text-xs">
                        {subject.academic_year}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
