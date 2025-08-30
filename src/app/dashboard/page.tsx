
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

const chartData = [
  { month: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "May", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Aug", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Sep", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Oct", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Nov", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Dec", total: Math.floor(Math.random() * 5000) + 1000 },
]

const recentSales = [
    { id: "1", customer: "Olivia Martin", email: "olivia.martin@email.com", amount: "₹1,999.00", status: "fulfilled" },
    { id: "2", customer: "Jackson Lee", email: "jackson.lee@email.com", amount: "₹3,299.00", status: "fulfilled" },
    { id: "3", customer: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "₹750.00", status: "pending" },
    { id: "4", customer: "William Kim", email: "will@email.com", amount: "₹2,499.00", status: "fulfilled" },
    { id: "5", customer: "Sofia Davis", email: "sofia.davis@email.com", amount: "₹1,299.00", status: "fulfilled" },
]


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
              Sales (Placeholder)
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Count (Placeholder)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
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
            <CardTitle>Overview (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales (Placeholder)</CardTitle>
            <CardDescription>
              You made 265 sales this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map(sale => (
                     <TableRow key={sale.id}>
                        <TableCell>
                            <div className="font-medium">{sale.customer}</div>
                            <div className="text-sm text-muted-foreground hidden md:inline">{sale.email}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={sale.status === 'fulfilled' ? 'default' : 'secondary'}>{sale.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{sale.amount}</TableCell>
                     </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

    