'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const taskTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'sheet', label: 'Sheet' },
  { value: 'project', label: 'Project' },
  { value: 'exam', label: 'Exam' },
];

interface TaskFiltersProps {
  subjects: { id: string; name: string }[];
}

export function TaskFilters({ subjects }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type') || 'all';
  const currentSubject = searchParams.get('subject') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/tasks?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="flex flex-wrap gap-1">
        {taskTypes.map((type) => (
          <Button
            key={type.value}
            variant={currentType === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('type', type.value)}
            className={cn('h-8 text-xs')}
          >
            {type.label}
          </Button>
        ))}
      </div>
      {subjects.length > 0 && (
        <Select
          value={currentSubject || 'all'}
          onValueChange={(v) => updateFilter('subject', v)}
        >
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
