'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { createSubject, updateSubject } from '@/actions/subjects';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Subject } from '@/types/database';

const SUBJECT_COLORS = [
  '#003087', '#0047ba', '#1a5276', '#1a3a5c',
  '#7d3c98', '#1e8449', '#ca6f1e', '#c0392b',
  '#117a65', '#2e4057', '#5f4b8b', '#2980b9',
];

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isEdit ? 'Update Subject' : 'Create Subject'}
    </Button>
  );
}

interface SubjectFormProps {
  subject?: Subject;
}

export function SubjectForm({ subject }: SubjectFormProps) {
  const [isActive, setIsActive] = useState(subject?.is_active ?? true);
  const [selectedColor, setSelectedColor] = useState(subject?.color || '#003087');
  const [error, setError] = useState('');

  const action = async (formData: FormData) => {
    setError('');
    formData.set('is_active', isActive.toString());
    formData.set('color', selectedColor);

    try {
      if (subject) {
        const result = await updateSubject(subject.id, formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
      } else {
        const result = await createSubject(formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
      }
      toast.success(subject ? 'Subject updated!' : 'Subject created!');
    } catch (err: unknown) {
      // Redirect throws - this is expected
      if (err instanceof Error && err.message !== 'NEXT_REDIRECT') {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <form action={action}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Thermodynamics"
                defaultValue={subject?.name}
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Subject Code *</Label>
              <Input
                id="code"
                name="code"
                placeholder="e.g., ME301"
                defaultValue={subject?.code}
                required
                minLength={2}
                maxLength={20}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief subject description..."
              defaultValue={subject?.description || ''}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                name="instructor"
                placeholder="e.g., Ahmed Hassan"
                defaultValue={subject?.instructor || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                name="semester"
                placeholder="e.g., Fall 2024"
                defaultValue={subject?.semester || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic Year</Label>
              <Input
                id="academic_year"
                name="academic_year"
                placeholder="e.g., 2024-2025"
                defaultValue={subject?.academic_year || ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              min="0"
              defaultValue={subject?.display_order ?? 0}
              className="w-24"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-foreground scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active (visible to students)
            </Label>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/50 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex gap-3">
        <SubmitButton isEdit={!!subject} />
      </div>
    </form>
  );
}
