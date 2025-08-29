
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  name: string;
  price: string;
  raw_price: number;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { translations } = useLanguage();
  const router = useRouter();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const cartRef = collection(db, 'users', user.uid, 'cart');
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
      setCartItems(items);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching cart items:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch cart items.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!user || newQuantity < 1) return;
    const itemRef = doc(db, 'users', user.uid, 'cart', itemId);
    try {
      await updateDoc(itemRef, { quantity: newQuantity });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update item quantity.' });
    }
  };

  const removeItem = async (itemId: string) => {
    if (!user) return;
    const itemRef = doc(db, 'users', user.uid, 'cart', itemId);
    try {
      await deleteDoc(itemRef);
      toast({ title: 'Item removed from cart.' });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not remove item from cart.' });
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.raw_price * item.quantity), 0);
  
  const t = translations.cart;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
        <div className="text-center">
            <p>Please log in to view your cart.</p>
            <Button asChild className="mt-4"><Link href="/auth">Sign In</Link></Button>
        </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] gap-4 text-center">
        <ShoppingCart className="size-24 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">{t.empty}</h2>
        <Button asChild>
          <Link href="/dashboard/products">{t.continueShopping}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <Image src={item.image} alt={item.name} width={100} height={100} className="rounded-md object-cover"/>
                  <div className="flex-grow">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-muted-foreground">{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="size-8" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <Minus className="size-4"/>
                    </Button>
                    <span>{item.quantity}</span>
                    <Button variant="outline" size="icon" className="size-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="size-4"/>
                    </Button>
                  </div>
                  <p className="w-24 text-right font-medium">₹{(item.raw_price * item.quantity).toLocaleString('en-IN')}</p>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                    <Trash2 className="size-5"/>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <Separator/>
            <div className="flex justify-between font-bold text-lg">
              <span>{t.total}</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push('/dashboard/checkout')}>
              {t.checkout}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
