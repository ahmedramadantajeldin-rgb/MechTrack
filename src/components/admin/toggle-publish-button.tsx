'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toggleAnnouncementPublished } from '@/actions/announcements';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function TogglePublishButton({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const result = await toggleAnnouncementPublished(id, !isPublished);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isPublished ? 'Unpublished' : 'Published successfully');
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isPublished ? 'Unpublish' : 'Publish'}
      title={isPublished ? 'Unpublish' : 'Publish'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPublished ? (
        <Eye className="h-4 w-4 text-green-600" />
      ) : (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
}
