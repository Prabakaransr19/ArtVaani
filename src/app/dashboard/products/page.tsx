
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Palette } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';

const products = [
  {
    id: 'prod_1',
    name: 'Hand-Painted Terracotta Vase',
    price: '₹1,299',
    raw_price: 1299,
    image: 'https://images.unsplash.com/photo-1677700064585-951e35e5e475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxIYW5kLVBhaW50ZWQlMjBUZXJyYWNvdHRhJTIwVmFzZSUyMHxlbnwwfHx8fDE3NTY0ODc0NTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    hint: 'terracotta vase',
    tags: ['Handmade', 'Eco-friendly'],
    description: 'A beautiful terracotta vase, hand-painted with traditional Indian motifs. Perfect for adding a rustic charm to your home decor.'
  },
  {
    id: 'prod_2',
    name: 'Madhubani Painting',
    price: '₹2,499',
    raw_price: 2499,
    image: 'https://images.unsplash.com/photo-1714249158162-02f2f5fe1ae9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxNYWRodWJhbmklMjBQYWludGluZ3xlbnwwfHx8fDE3NTY0ODc1NjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    hint: 'madhubani art',
    tags: ['Folk Art', 'Wall Decor'],
    description: 'An intricate Madhubani painting depicting scenes from Indian mythology. A vibrant and culturally rich addition to any wall.'
  },
  {
    id: 'prod_3',
    name: 'Pashmina Shawl',
    price: '₹7,999',
    raw_price: 7999,
    image: 'https://picsum.photos/600/400?random=3',
    hint: 'pashmina shawl',
    tags: ['Luxury', 'Fashion'],
    description: 'An exquisitely soft and warm Pashmina shawl, handwoven by artisans in Kashmir. A timeless piece of luxury.'
  },
  {
    id: 'prod_4',
    name: 'Wooden Elephant Figurine',
    price: '₹899',
    raw_price: 899,
    image: 'https://picsum.photos/600/400?random=4',
    hint: 'wooden elephant',
    tags: ['Hand-carved', 'Decor'],
    description: 'A charming wooden elephant, hand-carved from a single block of wood. Symbolizes strength and good fortune.'
  },
  {
    id: 'prod_5',
    name: 'Jaipuri Blue Pottery Plate',
    price: '₹1,599',
    raw_price: 1599,
    image: 'https://picsum.photos/600/400?random=5',
    hint: 'blue pottery',
    tags: ['Ceramic', 'Decorative'],
    description: 'A stunning decorative plate made using the famous Jaipuri blue pottery technique. Features a beautiful floral design.'
  },
  {
    id: 'prod_6',
    name: 'Kalamkari Fabric',
    price: '₹1,899',
    raw_price: 1899,
    image: 'https://picsum.photos/600/400?random=6',
    hint: 'kalamkari fabric',
    tags: ['Textile', 'Natural Dyes'],
    description: 'Hand-printed Kalamkari fabric with intricate patterns using natural dyes. Ideal for custom apparel or home furnishings.'
  },
];

export default function ProductsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { translations } = useLanguage();
    const [isArtisan, setIsArtisan] = useState(false);

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

    const handleAddToCart = async (product: typeof products[0]) => {
        if (!user) {
            toast({
                title: 'Please Sign In',
                description: 'You need to be logged in to add items to the cart.',
                action: <Button onClick={() => router.push('/auth')}>Sign In</Button>
            });
        } else {
            try {
              const cartRef = doc(collection(db, 'users', user.uid, 'cart'), product.id);
              await setDoc(cartRef, {
                ...product,
                quantity: 1,
                addedAt: serverTimestamp(),
              }, { merge: true }); // Use merge to avoid overwriting quantity if it already exists
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
            <Card key={product.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="p-0">
                <div className="relative aspect-video">
                    <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill 
                        className="object-cover"
                        data-ai-hint={product.hint}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <div className="flex gap-2 mb-2">
                    {product.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-muted-foreground mt-1">{product.price}</p>
                <CardDescription className="mt-2 text-sm">{product.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 mt-auto">
                <Button className="w-full" onClick={() => handleAddToCart(product)}>
                <ShoppingCart className="mr-2" />
                Add to Cart
                </Button>
            </CardFooter>
            </Card>
        ))}
        </div>
    </div>
  );
}
