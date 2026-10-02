import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Pencil, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { DeleteSubjectButton } from '@/components/admin/delete-subject-button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Subjects' };

export default async function AdminSubjectsPage() {
  const supabase = createClient();
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subjects</h1>
          <p className="text-muted-foreground">{subjects?.length || 0} total subjects</p>
        </div>
        <Button asChild>
          <Link href="/admin/subjects/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
          </Link>
        </Button>
      </div>

      {!subjects?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No subjects yet. Add your first subject.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/subjects/new">Add Subject</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {subjects.map((subject) => (
            <Card key={subject.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: subject.color || '#003087' }}
                  >
                    {subject.code.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{subject.name}</p>
                      <Badge variant="outline" className="text-xs">{subject.code}</Badge>
                      {!subject.is_active && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    {subject.instructor && (
                      <p className="text-sm text-muted-foreground">Dr. {subject.instructor}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" asChild aria-label="Edit subject">
                      <Link href={`/admin/subjects/${subject.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteSubjectButton id={subject.id} name={subject.name} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
