
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  PackagePlus,
  Mic,
  Search,
  PanelLeft,
  LogOut,
  User as UserIcon,
  LogIn,
  ShoppingBag,
  ShoppingCart,
  Palette,
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
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/hooks/use-auth';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { translations } = useLanguage();
  const { user } = useAuth();
  const [isArtisan, setIsArtisan] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().isArtisan) {
                setIsArtisan(true);
            } else {
                setIsArtisan(false);
            }
        } else {
            setIsArtisan(false);
        }
    };
    checkUserRole();
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/auth');
  };

  const allMenuItems = [
    // Publicly visible
    { href: '/dashboard/products', label: translations.sidebar.products, icon: ShoppingBag, requiresAuth: false, requiresArtisan: false },
    { href: '/dashboard/discovery', label: translations.sidebar.discoverCrafts, icon: Search, requiresAuth: false, requiresArtisan: false },
    // Buyer + Artisan
    { href: '/dashboard/cart', label: translations.sidebar.cart, icon: ShoppingCart, requiresAuth: true, requiresArtisan: false },
    { href: '/dashboard/for-artisans', label: translations.sidebar.forArtisans, icon: Palette, requiresAuth: true, requiresArtisan: 'not-artisan' },
    // Artisan only
    { href: '/dashboard', label: translations.sidebar.dashboard, icon: Home, requiresAuth: true, requiresArtisan: true },
    { href: '/dashboard/add-product', label: translations.sidebar.addProduct, icon: PackagePlus, requiresAuth: true, requiresArtisan: true },
    { href: '/dashboard/story-creation', label: translations.sidebar.storyCreation, icon: Mic, requiresAuth: true, requiresArtisan: true },
  ];

  const menuItems = allMenuItems.filter(item => {
    if(item.requiresArtisan === 'not-artisan') {
      return user && !isArtisan;
    }
    if (item.requiresArtisan) {
        return user && isArtisan;
    }
    if (item.requiresAuth) {
        return !!user;
    }
    return true;
  });

  const getInitials = (name?: string | null) => {
    if (!name) return 'A';
    const names = name.split(' ');
    if (names.length > 1) {
        return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  }

  const getPageTitle = () => {
    // This explicit mapping avoids enumeration issues with newer Next.js versions
    if (pathname === '/dashboard') return translations.sidebar.dashboard;
    if (pathname.startsWith('/dashboard/products')) return translations.sidebar.products;
    if (pathname.startsWith('/dashboard/add-product')) return translations.sidebar.addProduct;
    if (pathname.startsWith('/dashboard/story-creation')) return translations.sidebar.storyCreation;
    if (pathname.startsWith('/dashboard/discovery')) return translations.sidebar.discoverCrafts;
    if (pathname.startsWith('/dashboard/cart')) return translations.sidebar.cart;
    if (pathname.startsWith('/dashboard/checkout')) return translations.checkout.title;
    if (pathname.startsWith('/dashboard/for-artisans')) return translations.sidebar.forArtisans;
    return 'ArtVaani';
  };

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
        <SidebarFooter>
          {user ? (
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleSignOut}>
                        <LogOut />
                        <span>Sign Out</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
          ) : (
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Link href="/auth">
                            <LogIn />
                            <span>Sign In</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
          )}
        </SidebarFooter>
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
                <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
            </div>
             {user && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.displayName || "Artisan"}</p>

                                <p className="text-xs leading-none text-muted-foreground">
                                {isArtisan ? 'Artisan Account' : 'Buyer Account'}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
