
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Baby, Footprints, HeartPulse, NotebookText } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/notes', label: 'Notes', icon: NotebookText },
  { href: '/dashboard/kicks', label: 'Kicks', icon: Footprints },
  { href: '/dashboard/contractions', label: 'Contractions', icon: HeartPulse },
  { href: '/dashboard/weight', label: 'Weight', icon: Baby },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
       <DashboardHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="grid h-16 grid-cols-5 items-center justify-center text-xs">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex flex-col items-center justify-center gap-1">
                <Icon
                  className={cn(
                    'h-6 w-6',
                    pathname === href ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-xs',
                     pathname === href ? 'text-primary font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
