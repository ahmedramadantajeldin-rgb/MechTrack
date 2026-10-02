'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function AddAdminForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to grant admin access');
        return;
      }

      toast.success(`Admin access granted to ${email}`);
      setEmail('');
      router.refresh();
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="admin-email">Email Address</Label>
        <Input
          id="admin-email"
          type="email"
          placeholder="user@must.edu.eg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/50 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <Button type="submit" disabled={isLoading || !email}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Grant Admin Access
      </Button>
    </form>
  );
}
