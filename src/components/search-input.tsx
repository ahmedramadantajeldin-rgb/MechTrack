'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  defaultValue?: string;
  className?: string;
  placeholder?: string;
}

export function SearchInput({
  defaultValue = '',
  className,
  placeholder = 'Search subjects, tasks, materials...',
}: SearchInputProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  let timeout: NodeJS.Timeout;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearTimeout(timeout);
    const value = e.target.value;
    timeout = setTimeout(() => {
      startTransition(() => {
        if (value.trim().length >= 2) {
          router.push(`/search?q=${encodeURIComponent(value.trim())}`);
        } else if (!value.trim()) {
          router.push('/search');
        }
      });
    }, 400);
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn('pl-9', isPending && 'opacity-70')}
        aria-label="Search"
      />
    </div>
  );
}
