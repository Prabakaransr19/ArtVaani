'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PackagePlus,
  Mic,
  Search,
  PanelLeft,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/product-listing', label: 'Product Listing', icon: PackagePlus },
  { href: '/dashboard/story-creation', label: 'Story Creation', icon: Mic },
  { href: '/dashboard/discovery', label: 'Discover Crafts', icon: Search },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo className="size-8 text-primary" />
            <span className="text-lg font-headline font-semibold">ArtVaani</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{
                    children: item.label,
                  }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/50 px-6 backdrop-blur-sm">
            <SidebarTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <PanelLeft />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SidebarTrigger>
            <div className="flex-1">
                <h1 className="text-lg font-semibold">{menuItems.find(item => item.href === pathname)?.label || 'Dashboard'}</h1>
            </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
