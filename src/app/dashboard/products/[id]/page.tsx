
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, limit, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Product } from '../page';

import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingCart } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export default function ProductDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const productId = params.id as string;
  const router = useRouter();

  const { toast } = useToast();
  const { translations } = useLanguage();
  const t = translations.productDetail;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      } else {
        toast({ variant: 'destructive', title: 'Product not found' });
        router.push('/dashboard/products');
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId, router, toast]);

  useEffect(() => {
    if (!product) return;

    // Fetch related products (simple implementation: fetch recent products, excluding the current one)
    const relatedQuery = query(
      collection(db, 'products'),
      where('__name__', '!=', product.id),
      limit(3)
    );

    const unsubscribe = onSnapshot(relatedQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setRelatedProducts(productsData);
    });

    return () => unsubscribe();
  }, [product]);

  const handleAddToCart = async () => {
    if (!user || !product) {
        toast({
            title: 'Please Sign In',
            description: 'You need to be logged in to add items to the cart.',
            action: <Button onClick={() => router.push('/auth')}>Sign In</Button>
        });
    } else {
        try {
          const cartRef = doc(collection(db, 'users', user.uid, 'cart'), product.id);
          const raw_price = parseFloat(product.price.replace(/[^0-9.-]+/g,""));
          await setDoc(cartRef, {
            id: product.id,
            name: product.name,
            price: product.price,
            raw_price: isNaN(raw_price) ? 0 : raw_price,
            image: product.image,
            quantity: 1,
            addedAt: serverTimestamp(),
          }, { merge: true });
          toast({
              title: 'Added to Cart!',
              description: `${product.name} has been added to your cart.`
          });
        } catch (error) {
           console.error("Error adding to cart: ", error);
           toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not add item to cart. Please try again.'
           })
        }
    }
  };


  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return null; // or a 'not found' component
  }

  return (
    <div className="max-w-6xl mx-auto">
        <Card>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                     <AspectRatio ratio={4/3} className="bg-muted rounded-tl-lg rounded-bl-lg">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover rounded-tl-lg rounded-bl-lg"
                        />
                    </AspectRatio>
                </div>
                <div className="p-6 flex flex-col">
                    <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                    <p className="text-2xl text-muted-foreground mt-2">{product.price}</p>
                    
                    <Separator className="my-6" />

                    <div className="flex-grow space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">{t.description}</h3>
                            <p className="text-muted-foreground">{product.description}</p>
                        </div>
                        <div>
                             <h3 className="font-semibold text-lg mb-2">{t.story}</h3>
                            <p className="text-muted-foreground">{product.story}</p>
                        </div>
                         <div className="flex gap-2 pt-2 flex-wrap">
                            {(product.hashtags || '').split(',').map(tag => tag.trim() && <Badge key={tag} variant="secondary">{tag.trim()}</Badge>)}
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button size="lg" className="w-full" onClick={handleAddToCart}>
                            <ShoppingCart className="mr-2"/>
                            {t.addToCart}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>

        <div className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight mb-6">{t.relatedProducts}</h2>
            {relatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedProducts.map((relatedProduct) => (
                        <Link key={relatedProduct.id} href={`/dashboard/products/${relatedProduct.id}`} className="flex">
                            <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full">
                            <CardHeader className="p-0">
                                <div className="relative aspect-video">
                                    <Image 
                                        src={relatedProduct.image} 
                                        alt={relatedProduct.name} 
                                        fill 
                                        className="object-cover"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <h3 className="text-lg font-semibold">{relatedProduct.name}</h3>
                                <p className="text-muted-foreground mt-1">{relatedProduct.price}</p>
                            </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">{t.noRelatedProducts}</p>
            )}
        </div>
    </div>
  );
}
