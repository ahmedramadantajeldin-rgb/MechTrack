'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { createCalendarEvent, updateCalendarEvent } from '@/actions/calendar';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CalendarEvent } from '@/types/database';

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEdit ? 'Update Event' : 'Create Event'}</Button>;
}

export function CalendarEventForm({ event, subjects }: { event?: CalendarEvent; subjects: { id: string; name: string }[] }) {
  const [type, setType] = useState(event?.type || 'general');
  const [subjectId, setSubjectId] = useState(event?.subject_id || '');
  const [error, setError] = useState('');

  const action = async (formData: FormData) => {
    setError('');
    formData.set('type', type);
    if (subjectId) formData.set('subject_id', subjectId); else formData.delete('subject_id');
    try {
      if (event) {
        const r = await updateCalendarEvent(event.id, formData);
        if (r?.error) { setError(r.error); return; }
      } else {
        const r = await createCalendarEvent(formData);
        if (r?.error) { setError(r.error); return; }
      }
      toast.success(event ? 'Event updated!' : 'Event created!');
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'NEXT_REDIRECT') setError('An error occurred.');
    }
  };

  return (
    <form action={action}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input id="title" name="title" placeholder="e.g., Thermodynamics Midterm Exam" defaultValue={event?.title} required minLength={2} maxLength={200} />
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
              <Label>Event Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment_deadline">Assignment Deadline</SelectItem>
                  <SelectItem value="project_deadline">Project Deadline</SelectItem>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="general">General Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Date *</Label>
              <Input id="event_date" name="event_date" type="date" defaultValue={event?.event_date || ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_time">Time (optional)</Label>
              <Input id="event_time" name="event_time" type="time" defaultValue={event?.event_time || ''} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="e.g., Hall A, Room 201" defaultValue={event?.location || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Additional details..." defaultValue={event?.description || ''} rows={3} />
          </div>
          {error && <div className="rounded-md bg-destructive/10 border border-destructive/50 px-3 py-2 text-sm text-destructive">{error}</div>}
        </CardContent>
      </Card>
      <div className="mt-4"><SubmitButton isEdit={!!event} /></div>
    </form>
  );
}
