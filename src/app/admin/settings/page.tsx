import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Info } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Settings' };

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" /> Settings
        </h1>
        <p className="text-muted-foreground">Portal configuration and information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" /> Portal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Portal Name</span>
            <span className="font-medium">Mechanical Engineering Portal</span>
            <span className="text-muted-foreground">Institution</span>
            <span className="font-medium">Misr University for Science and Technology</span>
            <span className="text-muted-foreground">Department</span>
            <span className="font-medium">Faculty of Engineering — Mechanical Engineering</span>
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0</span>
            <span className="text-muted-foreground">Framework</span>
            <span className="font-medium">Next.js 14</span>
            <span className="text-muted-foreground">Database</span>
            <span className="font-medium">Supabase (PostgreSQL)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Storage Buckets</CardTitle>
          <CardDescription>Configure storage in your Supabase dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">task-attachments</p>
              <p className="text-muted-foreground text-xs">Task PDF attachments and documents</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">Public</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">materials</p>
              <p className="text-muted-foreground text-xs">Academic materials and resources</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">Public</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
            Supabase Dashboard ↗
          </a>
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
            Vercel Dashboard ↗
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
