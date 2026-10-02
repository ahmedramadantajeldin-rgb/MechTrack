import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Announcements',
  description: 'Latest announcements from the Mechanical Engineering Department',
};

const priorityConfig = {
  normal: { label: 'Normal', class: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  important: { label: 'Important', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  urgent: { label: 'Urgent', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

async function getAnnouncements() {
  const supabase = createClient();
  const { data } = await supabase
    .from('announcements')
    .select('*, subject:subjects(id, name)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-muted-foreground">Latest news and notices from the department</p>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No announcements"
          description="There are no announcements at this time. Check back later."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const priority = priorityConfig[ann.priority as keyof typeof priorityConfig] || priorityConfig.normal;
            return (
              <Card
                key={ann.id}
                className={ann.priority === 'urgent' ? 'border-red-300 dark:border-red-800' : ''}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {ann.priority !== 'normal' && (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${priority.class}`}>
                            {priority.label}
                          </span>
                        )}
                        {ann.subject && (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-primary/10 text-primary">
                            {ann.subject.name}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-base md:text-lg">{ann.title}</CardTitle>
                    </div>
                    <time className="text-xs text-muted-foreground shrink-0">
                      {format(parseISO(ann.created_at), 'MMM d, yyyy')}
                    </time>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ann.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
