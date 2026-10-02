import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pencil, FileText, ExternalLink, Youtube, HardDrive } from 'lucide-react';
import Link from 'next/link';
import { DeleteMaterialButton } from '@/components/admin/delete-material-button';
import { formatFileSize } from '@/lib/file-validator';
import type { Metadata } from 'next';
import type { MaterialType } from '@/types/database';

export const metadata: Metadata = { title: 'Manage Materials' };

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  youtube: Youtube,
  google_drive: HardDrive,
  external_link: ExternalLink,
  document: FileText,
  presentation: FileText,
  spreadsheet: FileText,
  image: FileText,
};

export default async function AdminMaterialsPage() {
  const supabase = createClient();
  const { data: materials } = await supabase
    .from('materials')
    .select('*, subject:subjects(name)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Materials</h1>
          <p className="text-muted-foreground">{materials?.length || 0} total materials</p>
        </div>
        <Button asChild>
          <Link href="/admin/materials/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Material
          </Link>
        </Button>
      </div>

      {!materials?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No materials yet.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/materials/new">Add Material</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {materials.map((mat) => {
            const Icon = typeIcons[mat.type] || FileText;
            return (
              <Card key={mat.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs uppercase">
                          {mat.type.replace('_', ' ')}
                        </Badge>
                        {mat.subject && (
                          <Badge variant="secondary" className="text-xs">{mat.subject.name}</Badge>
                        )}
                      </div>
                      <p className="font-semibold">{mat.title}</p>
                      {mat.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{mat.description}</p>
                      )}
                      {mat.file_size && (
                        <p className="text-xs text-muted-foreground mt-1">{formatFileSize(mat.file_size)}</p>
                      )}
                      {(mat.file_url || mat.external_url) && (
                        <a
                          href={mat.file_url || mat.external_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                          View resource ↗
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="icon" asChild aria-label="Edit material">
                        <Link href={`/admin/materials/${mat.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteMaterialButton id={mat.id} title={mat.title} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
