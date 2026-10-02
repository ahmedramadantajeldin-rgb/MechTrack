import { LoginForm } from '@/components/admin/login-form';
import { GraduationCap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Sign in to the ME Portal administration panel',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; redirectedFrom?: string };
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg mb-4">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground">ME Portal</h1>
          <p className="text-sm text-muted-foreground">Administration Panel</p>
          <p className="text-xs text-muted-foreground mt-1">
            Faculty of Engineering — MUST
          </p>
        </div>

        {/* Error Messages */}
        {searchParams.error === 'unauthorized' && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            You do not have administrator access.
          </div>
        )}

        {/* Login Form */}
        <LoginForm redirectTo={searchParams.redirectedFrom} />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Mechanical Engineering Department — MUST
        </p>
      </div>
    </div>
  );
}
