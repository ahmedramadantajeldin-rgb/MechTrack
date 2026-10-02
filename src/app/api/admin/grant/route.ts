import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify the caller is an admin
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    // Find the user by email
    const adminClient = createAdminClient();
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });

    const targetUser = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!targetUser) {
      return NextResponse.json({ error: 'No user found with that email. They must register first.' }, { status: 404 });
    }

    // Update or insert profile with admin role
    const { error: upsertError } = await adminClient
      .from('profiles')
      .upsert({ id: targetUser.id, email: targetUser.email || email, role: 'admin' }, { onConflict: 'id' });

    if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Grant admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
