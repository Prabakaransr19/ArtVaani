
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  displayName: z.string().min(3, 'Full name must be at least 3 characters.'),
  city: z.string().min(2, 'City is required.'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number.'),
  artType: z.string().min(3, 'Please describe your art.'),
  experience: z.string().min(1, 'Please enter your years of experience.'),
});

type FormValues = z.infer<typeof formSchema>;

interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { translations } = useLanguage();
  const t = translations.profile;

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }
    
    const fetchUserData = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const data = userDoc.data();
            setValue('displayName', data.displayName || '');
            setValue('city', data.city || '');
            setValue('phoneNumber', data.phoneNumber || '');
            setValue('artType', data.artType || '');
            setValue('experience', data.experience || '');
        }
        setIsPageLoading(false);
    }

    fetchUserData();
  }, [user, authLoading, router, setValue]);

  useEffect(() => {
    if (!user) return;

    const productsQuery = query(collection(db, 'products'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setMyProducts(productsData);
        setProductsLoading(false);
    }, (error) => {
        console.error("Error fetching user products:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your products.' });
        setProductsLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await updateProfile(user, { displayName: data.displayName });
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        displayName: data.displayName,
        city: data.city,
        phoneNumber: data.phoneNumber,
        artType: data.artType,
        experience: data.experience,
      }, { merge: true });

      toast({ title: t.success.title, description: t.success.description });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading || authLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex justify-center">
        <div className="w-full max-w-4xl space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <User className="size-8 text-primary" />
                        <div>
                            <CardTitle>{t.title}</CardTitle>
                            <CardDescription>{t.description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">{t.form.displayName.label}</Label>
                            <Input id="displayName" {...register('displayName')} />
                            {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">{t.form.city.label}</Label>
                            <Input id="city" {...register('city')} />
                            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="phoneNumber">{t.form.phoneNumber.label}</Label>
                    <Input id="phoneNumber" type="tel" {...register('phoneNumber')} />
                    {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="artType">{t.form.artType.label}</Label>
                            <Input id="artType" {...register('artType')} />
                            {errors.artType && <p className="text-sm text-destructive">{errors.artType.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience">{t.form.experience.label}</Label>
                            <Input id="experience" {...register('experience')} />
                            {errors.experience && <p className="text-sm text-destructive">{errors.experience.message}</p>}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : t.button}
                    </Button>
                </CardFooter>
                </form>
            </Card>

            <Separator />
            
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Package className="size-8 text-primary" />
                        <div>
                            <CardTitle>{t.myProducts.title}</CardTitle>
                            <CardDescription>{t.myProducts.description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {productsLoading ? (
                        <div className="flex justify-center"><Loader2 className="animate-spin"/></div>
                    ) : myProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myProducts.map(product => (
                                <div key={product.id} className="border rounded-lg overflow-hidden">
                                    <div className="relative aspect-video">
                                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-semibold truncate">{product.name}</h4>
                                        <p className="text-sm text-muted-foreground">{product.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>{t.myProducts.placeholder}</p>
                             <Button onClick={() => router.push('/dashboard/add-product')} className="mt-4">Add your first product</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </main>
  );
}
