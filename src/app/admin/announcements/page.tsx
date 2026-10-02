import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Pencil } from 'lucide-react';
import Link from 'next/link';
import { DeleteAnnouncementButton } from '@/components/admin/delete-announcement-button';
import { TogglePublishButton } from '@/components/admin/toggle-publish-button';
import { format, parseISO } from 'date-fns';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Announcements' };

const priorityColors = {
  normal: '',
  important: 'border-yellow-300 dark:border-yellow-700',
  urgent: 'border-red-300 dark:border-red-700',
};

export default async function AdminAnnouncementsPage() {
  const supabase = createClient();
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, subject:subjects(name)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">{announcements?.length || 0} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/announcements/new">
            <PlusCircle className="mr-2 h-4 w-4" /> New Announcement
          </Link>
        </Button>
      </div>

      {!announcements?.length ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No announcements yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {announcements.map((ann) => (
            <Card key={ann.id} className={priorityColors[ann.priority as keyof typeof priorityColors] || ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {ann.is_published ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Published</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted text-muted-foreground">Draft</span>
                      )}
                      {ann.priority !== 'normal' && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                          ann.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>{ann.priority}</span>
                      )}
                      {ann.subject && (
                        <span className="text-xs text-muted-foreground">{ann.subject.name}</span>
                      )}
                    </div>
                    <p className="font-semibold">{ann.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{ann.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(ann.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <TogglePublishButton id={ann.id} isPublished={ann.is_published} />
                    <Button variant="ghost" size="icon" asChild aria-label="Edit announcement">
                      <Link href={`/admin/announcements/${ann.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteAnnouncementButton id={ann.id} title={ann.title} />
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
