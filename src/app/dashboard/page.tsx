
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Loader2, DollarSign, Users, CreditCard, Package, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';


export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isArtisan, setIsArtisan] = useState(false);
    const [isRoleLoading, setIsRoleLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        newProductsThisMonth: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace('/dashboard/products');
            return;
        }

        const checkUserRole = async () => {
            const userDocRef = doc(db, 'users', user.uid);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().isArtisan) {
                    setIsArtisan(true);
                } else {
                    router.replace('/dashboard/products');
                }
            } catch (error) {
                console.error("Error fetching user role, assuming buyer.", error);
                router.replace('/dashboard/products');
            } finally {
                setIsRoleLoading(false);
            }
        };

        checkUserRole();

    }, [user, loading, router]);
    
    useEffect(() => {
        if (!user || !isArtisan) return;

        const fetchStats = async () => {
            setStatsLoading(true);
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where('userId', '==', user.uid));
            
            const querySnapshot = await getDocs(q);
            const products = querySnapshot.docs.map(doc => doc.data());
            
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);

            const newProductsThisMonth = products.filter(p => {
                const createdAt = p.createdAt as Timestamp;
                return createdAt && createdAt >= thirtyDaysAgoTimestamp;
            }).length;

            setStats({
                totalProducts: products.length,
                newProductsThisMonth: newProductsThisMonth,
            });

            setStatsLoading(false);
        };

        fetchStats();
    }, [user, isArtisan]);


  if (loading || isRoleLoading || !isArtisan) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products Listed
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Loader2 className="animate-spin" /> : (
              <>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  All-time products you have listed
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sales
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No sales data available yet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Count</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No order data available yet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Products This Month
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Loader2 className="animate-spin" /> : (
                <>
                    <div className="text-2xl font-bold">+{stats.newProductsThisMonth}</div>
                    <p className="text-xs text-muted-foreground">
                      New products in the last 30 days
                    </p>
                </>
            )}
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
             <CardDescription>
              Your sales data will appear here once you receive your first order.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <div className="h-[350px] w-full flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">No sales data yet</p>
             </div>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              Your recent sales will be displayed here.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-[350px] w-full flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">No recent sales</p>
             </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
