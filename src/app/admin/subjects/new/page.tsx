import { SubjectForm } from '@/components/admin/subject-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Add Subject' };

export default function NewSubjectPage() {
  return (
    <div className="max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/admin/subjects" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Subjects
        </Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">Add New Subject</h1>
      <SubjectForm />
    </div>
  );
}
