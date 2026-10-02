'use client';

import { useState, useRef } from 'react';
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
import { createMaterial, updateMaterial, uploadMaterialFile } from '@/actions/materials';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Material } from '@/types/database';
import { formatFileSize, validateFile } from '@/lib/file-validator';
import { createClient } from '@/lib/supabase/client';

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isEdit ? 'Update Material' : 'Create Material'}
    </Button>
  );
}

interface MaterialFormProps {
  material?: Material;
  subjects: { id: string; name: string }[];
}

export function MaterialForm({ material, subjects }: MaterialFormProps) {
  const [type, setType] = useState(material?.type || 'external_link');
  const [subjectId, setSubjectId] = useState(material?.subject_id || '');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedId, setUploadedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const isFileType = ['pdf', 'image', 'document', 'presentation', 'spreadsheet'].includes(type);
  const isUrlType = ['youtube', 'google_drive', 'external_link'].includes(type);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = validateFile(file);
    if (!result.valid) {
      toast.error(result.error);
      return;
    }
    setSelectedFile(file);
  };

  const action = async (formData: FormData) => {
    setError('');
    formData.set('type', type);
    if (subjectId) formData.set('subject_id', subjectId);
    else formData.delete('subject_id');

    try {
      let materialId = material?.id || uploadedId;
      
      if (!materialId) {
        // Create material first, then upload file if needed
        const result = await createMaterial(formData);
        if (result?.error) { setError(result.error); return; }
        toast.success('Material created!');
        return;
      } else {
        const result = await updateMaterial(materialId, formData);
        if (result?.error) { setError(result.error); return; }
        toast.success('Material updated!');
        return;
      }
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
              placeholder="e.g., Chapter 3 Lecture Notes"
              defaultValue={material?.title}
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
              <Label>Material Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="document">Word Document</SelectItem>
                  <SelectItem value="presentation">PowerPoint</SelectItem>
                  <SelectItem value="spreadsheet">Excel Spreadsheet</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="youtube">YouTube Video</SelectItem>
                  <SelectItem value="google_drive">Google Drive</SelectItem>
                  <SelectItem value="external_link">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of this material..."
              defaultValue={material?.description || ''}
              rows={2}
            />
          </div>

          {isUrlType && (
            <div className="space-y-2">
              <Label htmlFor="external_url">URL *</Label>
              <Input
                id="external_url"
                name="external_url"
                type="url"
                placeholder={
                  type === 'youtube'
                    ? 'https://youtube.com/watch?v=...'
                    : type === 'google_drive'
                    ? 'https://drive.google.com/...'
                    : 'https://...'
                }
                defaultValue={material?.external_url || ''}
                required={isUrlType}
              />
              <p className="text-xs text-muted-foreground">
                {type === 'youtube' && 'Paste a YouTube video URL'}
                {type === 'google_drive' && 'Paste a Google Drive share link'}
                {type === 'external_link' && 'Paste any HTTPS URL'}
              </p>
            </div>
          )}

          {isFileType && (
            <div className="space-y-2">
              <Label>File</Label>
              {material?.file_url && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm">
                  <span>Current: {material.file_name}</span>
                  {material.file_size && <span className="text-muted-foreground">({formatFileSize(material.file_size)})</span>}
                  <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-auto">View</a>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                File upload: After creating the material, use the edit page to upload a file via the API.
                Supported: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, PNG, JPG (max 50MB)
              </p>
              <div className="p-3 rounded-md border border-dashed border-muted-foreground/30 text-center text-sm text-muted-foreground">
                File uploads available after material creation via admin edit page.
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              min="0"
              defaultValue={material?.display_order ?? 0}
              className="w-24"
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
        <SubmitButton isEdit={!!material} />
      </div>
    </form>
  );
}
