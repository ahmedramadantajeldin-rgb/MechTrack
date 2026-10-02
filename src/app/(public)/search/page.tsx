import { createClient } from '@/lib/supabase/server';
import { TaskCard } from '@/components/task-card';
import { EmptyState } from '@/components/empty-state';
import { SearchInput } from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, Bell } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search subjects, tasks, materials, and announcements',
};

async function searchContent(query: string) {
  if (!query || query.trim().length < 2) return null;

  const supabase = createClient();
  const q = `%${query.trim()}%`;

  const [subjects, tasks, materials, announcements] = await Promise.all([
    supabase
      .from('subjects')
      .select('id, name, code, description')
      .or(`name.ilike.${q},code.ilike.${q},description.ilike.${q}`)
      .eq('is_active', true)
      .limit(5),
    supabase
      .from('tasks')
      .select('*, subject:subjects(id, name, code, color)')
      .or(`title.ilike.${q},description.ilike.${q}`)
      .limit(10),
    supabase
      .from('materials')
      .select('id, title, type, description, subject:subjects(name)')
      .or(`title.ilike.${q},description.ilike.${q}`)
      .limit(10),
    supabase
      .from('announcements')
      .select('id, title, body, priority')
      .or(`title.ilike.${q},body.ilike.${q}`)
      .eq('is_published', true)
      .limit(5),
  ]);

  return {
    subjects: subjects.data || [],
    tasks: tasks.data || [],
    materials: materials.data || [],
    announcements: announcements.data || [],
  };
}

interface PageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q || '';
  const results = await searchContent(query);
  const hasResults =
    results &&
    (results.subjects.length > 0 ||
      results.tasks.length > 0 ||
      results.materials.length > 0 ||
      results.announcements.length > 0);
  const totalResults = results
    ? results.subjects.length +
      results.tasks.length +
      results.materials.length +
      results.announcements.length
    : 0;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-muted-foreground">Find subjects, tasks, materials, and announcements</p>
      </div>

      <div className="mb-6">
        <SearchInput defaultValue={query} />
      </div>

      {!query && (
        <EmptyState
          icon={Search}
          title="Search the portal"
          description="Type at least 2 characters to search across subjects, tasks, materials, and announcements."
        />
      )}

      {query && !hasResults && results && (
        <EmptyState
          icon={Search}
          title={`No results for "${query}"`}
          description="Try different keywords or check your spelling."
        />
      )}

      {hasResults && (
        <div className="space-y-8">
          <p className="text-sm text-muted-foreground">
            {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>

          {results!.subjects.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Subjects ({results!.subjects.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results!.subjects.map((s) => (
                  <Link key={s.id} href={`/subjects/${s.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{s.code}</Badge>
                        </div>
                        <p className="font-medium">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results!.tasks.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3">Tasks ({results!.tasks.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results!.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

          {results!.announcements.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4" /> Announcements ({results!.announcements.length})
              </h2>
              <div className="space-y-3">
                {results!.announcements.map((ann) => (
                  <Link key={ann.id} href="/announcements">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <p className="font-medium">{ann.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ann.body}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
