
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';

export interface Product {
    id: string;
    name: string;
    description: string;
    story: string;
    price: string;
    raw_price?: number;
    image: string;
    hashtags: string;
    userId: string;
    createdAt: Timestamp;
}

export default function ProductsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { translations } = useLanguage();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isArtisan, setIsArtisan] = useState(false);

    useEffect(() => {
        const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(productsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching products:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch products.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    useEffect(() => {
        const checkUserRole = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().isArtisan) {
                    setIsArtisan(true);
                }
            }
        };
        checkUserRole();
    }, [user]);

  if (loading) {
    return (
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
            <Loader2 className="size-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
        {user && !isArtisan && (
            <Card className="bg-primary/10 border-primary/20">
                <CardHeader className="flex-row items-center gap-4">
                     <Palette className="size-8 text-primary" />
                    <div>
                        <CardTitle>{translations.products.becomeArtisan.title}</CardTitle>
                        <CardDescription>{translations.products.becomeArtisan.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardFooter>
                    <Button onClick={() => router.push('/dashboard/for-artisans')}>
                        {translations.products.becomeArtisan.button}
                    </Button>
                </CardFooter>
            </Card>
        )}
        {products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
                <h3 className="text-lg font-semibold">No products yet</h3>
                <p>Check back later to see beautiful crafts from our artisans.</p>
            </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <Link key={product.id} href={`/dashboard/products/${product.id}`} className="flex">
                        <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full">
                        <CardHeader className="p-0">
                            <div className="relative aspect-video">
                                <Image 
                                    src={product.image} 
                                    alt={product.name} 
                                    fill 
                                    className="object-cover"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {(product.hashtags || '').split(',').map(tag => tag.trim() && <Badge key={tag} variant="secondary">{tag.trim()}</Badge>)}
                            </div>
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="text-muted-foreground mt-1">{product.price}</p>
                            <CardDescription className="mt-2 text-sm line-clamp-2">{product.description}</CardDescription>
                        </CardContent>
                        <CardFooter className="p-4 mt-auto">
                           <Button className="w-full" variant="outline">
                             View Details
                           </Button>
                        </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        )}
    </div>
  );
}
