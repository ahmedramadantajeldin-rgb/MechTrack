'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { createTask, updateTask } from '@/actions/tasks';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Task } from '@/types/database';

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isEdit ? 'Update Task' : 'Create Task'}
    </Button>
  );
}

interface TaskFormProps {
  task?: Task;
  subjects: { id: string; name: string }[];
}

export function TaskForm({ task, subjects }: TaskFormProps) {
  const [type, setType] = useState(task?.type || 'assignment');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [status, setStatus] = useState(task?.status || 'pending');
  const [subjectId, setSubjectId] = useState(task?.subject_id || '');
  const [error, setError] = useState('');

  const action = async (formData: FormData) => {
    setError('');
    formData.set('type', type);
    formData.set('priority', priority);
    formData.set('status', status);
    if (subjectId) formData.set('subject_id', subjectId);
    else formData.delete('subject_id');

    try {
      if (task) {
        const result = await updateTask(task.id, formData);
        if (result?.error) { setError(result.error); return; }
      } else {
        const result = await createTask(formData);
        if (result?.error) { setError(result.error); return; }
      }
      toast.success(task ? 'Task updated!' : 'Task created!');
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'NEXT_REDIRECT') {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <form action={action}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Chapter 3 Assignment"
              defaultValue={task?.title}
              required
              minLength={2}
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subjectId || 'none'} onValueChange={(v) => setSubjectId(v === 'none' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="No subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Subject</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="sheet">Sheet</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Task description, instructions..."
              defaultValue={task?.description || ''}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                defaultValue={task?.deadline?.split('T')[0] || task?.deadline || ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_url">External URL</Label>
            <Input
              id="external_url"
              name="external_url"
              type="url"
              placeholder="https://example.com"
              defaultValue={task?.external_url || ''}
            />
            <p className="text-xs text-muted-foreground">YouTube, Google Drive, or any HTTPS URL</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (visible to students)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional notes or instructions..."
              defaultValue={task?.notes || ''}
              rows={2}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/50 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4">
        <SubmitButton isEdit={!!task} />
      </div>
    </form>
  );
}
