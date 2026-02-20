'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface AppSidebarProps {
  userRole?: 'admin' | 'member';
}

const navItems = [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];

const adminItems = [{ href: '/admin', label: 'Admin', icon: Shield }];

export function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();

  const items = userRole === 'admin' ? [...navItems, ...adminItems] : navItems;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center">
          <Image src="/images/logo_dark.png" alt="batchNews" width={120} height={36} priority />
        </Link>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-gold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
