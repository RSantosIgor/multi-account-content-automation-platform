'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type BreadcrumbSegment = {
  label: string;
  href?: string;
  isLast: boolean;
};

function formatSegmentLabel(segment: string): string {
  // Handle UUIDs - replace with context-specific names
  if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return 'Detalhes';
  }

  // Format common paths
  const formatted: Record<string, string> = {
    accounts: 'Contas',
    settings: 'Configurações',
    timeline: 'Timeline',
    sites: 'Sites',
    new: 'Novo',
  };

  return formatted[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Breadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumbs on root-level sidebar pages
  const hiddenPaths = ['/dashboard', '/accounts', '/admin'];
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  // Parse pathname into segments
  const pathSegments = pathname
    .split('/')
    .filter((segment) => segment.length > 0 && segment !== '(app)');

  // Build breadcrumb items
  const breadcrumbs: BreadcrumbSegment[] = [];

  // Add Home
  breadcrumbs.push({
    label: 'Home',
    href: '/dashboard',
    isLast: false,
  });

  // Build intermediate segments
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    breadcrumbs.push({
      label: formatSegmentLabel(segment),
      href: isLast ? undefined : currentPath,
      isLast,
    });
  });

  // Don't render if only Home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <BreadcrumbRoot className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href!}>
                    {index === 0 ? <Home className="h-4 w-4" /> : crumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!crumb.isLast && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </div>
        ))}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
