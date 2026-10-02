import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  ExternalLink,
  Youtube,
  HardDrive,
  BookOpen,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { MaterialType } from '@/types/database';
import Image from 'next/image';
import { getYoutubeThumbnail } from '@/lib/url-validator';

export const metadata: Metadata = {
  title: 'Materials',
  description: 'Access academic materials, PDFs, lecture slides, and resources',
};

const materialTypeIcons: Record<MaterialType, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  image: FileText,
  document: FileText,
  presentation: FileText,
  spreadsheet: FileText,
  youtube: Youtube,
  google_drive: HardDrive,
  external_link: ExternalLink,
};

const materialTypeColors: Record<MaterialType, string> = {
  pdf: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  image: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  document: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  presentation: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  spreadsheet: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  youtube: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  google_drive: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  external_link: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

async function getMaterials() {
  const supabase = createClient();
  const { data } = await supabase
    .from('materials')
    .select('*, subject:subjects(id, name, code)')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function MaterialsPage() {
  const materials = await getMaterials();

  const grouped = materials.reduce(
    (acc, mat) => {
      const key = mat.subject?.name || 'General';
      if (!acc[key]) acc[key] = [];
      acc[key].push(mat);
      return acc;
    },
    {} as Record<string, typeof materials>
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Materials</h1>
        <p className="text-muted-foreground">
          Lecture notes, PDFs, videos, and academic resources
        </p>
      </div>

      {materials.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No materials yet"
          description="Academic materials will appear here once added by your instructor."
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([subjectName, subjectMaterials]) => (
            <section key={subjectName}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {subjectName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectMaterials.map((mat) => {
                  const Icon = materialTypeIcons[mat.type as MaterialType] || FileText;
                  const colorClass = materialTypeColors[mat.type as MaterialType] || '';
                  const href = mat.file_url || mat.external_url || '#';
                  const thumbnail =
                    mat.type === 'youtube' && mat.external_url
                      ? getYoutubeThumbnail(mat.external_url)
                      : null;

                  return (
                    <a
                      key={mat.id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group-hover:border-primary/50">
                        {thumbnail && (
                          <div className="relative h-32 overflow-hidden rounded-t-lg">
                            <Image
                              src={thumbnail}
                              alt={mat.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${colorClass}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                {mat.title}
                              </p>
                              {mat.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {mat.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
                                  {mat.type.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
