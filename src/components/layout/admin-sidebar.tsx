'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  FileText,
  Bell,
  Calendar,
  Users,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/admin/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/admin/materials', label: 'Materials', icon: FileText },
  { href: '/admin/announcements', label: 'Announcements', icon: Bell },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/admins', label: 'Administrators', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-background min-h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex flex-col gap-1 p-3">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
