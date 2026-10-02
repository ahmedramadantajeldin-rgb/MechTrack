import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield } from 'lucide-react';
import { AddAdminForm } from '@/components/admin/add-admin-form';
import { RemoveAdminButton } from '@/components/admin/remove-admin-button';
import { format, parseISO } from 'date-fns';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Administrators' };

export default async function AdminManagementPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: admins } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')
    .eq('role', 'admin')
    .order('created_at');

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" /> Administrators
        </h1>
        <p className="text-muted-foreground">Manage who has administrative access to this portal.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Current Administrators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {admins?.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{admin.full_name || admin.email}</p>
                <p className="text-xs text-muted-foreground">{admin.email}</p>
                <p className="text-xs text-muted-foreground">Added {format(parseISO(admin.created_at), 'MMM d, yyyy')}</p>
              </div>
              <div className="flex items-center gap-2">
                {admin.id === user?.id ? (
                  <Badge variant="secondary">You</Badge>
                ) : (
                  <RemoveAdminButton id={admin.id} email={admin.email} />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grant Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Enter the email of an existing user to grant them administrator access. The user must have already registered an account.
          </p>
          <AddAdminForm />
        </CardContent>
      </Card>
    </div>
  );
}
