import { AdminNav } from '@/components/layout/admin-nav';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav profile={profile} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
