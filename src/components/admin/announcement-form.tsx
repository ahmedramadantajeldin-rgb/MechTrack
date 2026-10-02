'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { createAnnouncement, updateAnnouncement } from '@/actions/announcements';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Announcement } from '@/types/database';

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEdit ? 'Update' : 'Create'}
    </Button>
  );
}

export function AnnouncementForm({ announcement, subjects }: { announcement?: Announcement; subjects: { id: string; name: string }[] }) {
  const [priority, setPriority] = useState(announcement?.priority || 'normal');
  const [isPublished, setIsPublished] = useState(announcement?.is_published ?? false);
  const [subjectId, setSubjectId] = useState(announcement?.subject_id || '');
  const [error, setError] = useState('');

  const action = async (formData: FormData) => {
    setError('');
    formData.set('priority', priority);
    formData.set('is_published', isPublished.toString());
    if (subjectId) formData.set('subject_id', subjectId); else formData.delete('subject_id');
    try {
      if (announcement) {
        const r = await updateAnnouncement(announcement.id, formData);
        if (r?.error) { setError(r.error); return; }
      } else {
        const r = await createAnnouncement(formData);
        if (r?.error) { setError(r.error); return; }
      }
      toast.success(announcement ? 'Updated!' : 'Created!');
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'NEXT_REDIRECT') setError('An error occurred.');
    }
  };

  return (
    <form action={action}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" placeholder="Announcement title" defaultValue={announcement?.title} required minLength={2} maxLength={200} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subjectId || 'none'} onValueChange={(v) => setSubjectId(v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="No subject" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Subject</SelectItem>
                  {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Content *</Label>
            <Textarea id="body" name="body" placeholder="Write your announcement here..." defaultValue={announcement?.body} required minLength={5} rows={6} />
          </div>
          <div className="flex items-center gap-3">
            <Switch id="is_published" checked={isPublished} onCheckedChange={setIsPublished} />
            <Label htmlFor="is_published" className="cursor-pointer">Publish immediately (visible to students)</Label>
          </div>
          {error && <div className="rounded-md bg-destructive/10 border border-destructive/50 px-3 py-2 text-sm text-destructive">{error}</div>}
        </CardContent>
      </Card>
      <div className="mt-4"><SubmitButton isEdit={!!announcement} /></div>
    </form>
  );
}
