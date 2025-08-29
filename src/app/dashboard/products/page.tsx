
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const products = [
  {
    id: 1,
    name: 'Hand-Painted Terracotta Vase',
    price: '₹1,299',
    image: 'https://picsum.photos/600/400?random=1',
    hint: 'terracotta vase',
    tags: ['Handmade', 'Eco-friendly'],
    description: 'A beautiful terracotta vase, hand-painted with traditional Indian motifs. Perfect for adding a rustic charm to your home decor.'
  },
  {
    id: 2,
    name: 'Madhubani Painting',
    price: '₹2,499',
    image: 'https://picsum.photos/600/400?random=2',
    hint: 'madhubani art',
    tags: ['Folk Art', 'Wall Decor'],
    description: 'An intricate Madhubani painting depicting scenes from Indian mythology. A vibrant and culturally rich addition to any wall.'
  },
  {
    id: 3,
    name: 'Pashmina Shawl',
    price: '₹7,999',
    image: 'https://picsum.photos/600/400?random=3',
    hint: 'pashmina shawl',
    tags: ['Luxury', 'Fashion'],
    description: 'An exquisitely soft and warm Pashmina shawl, handwoven by artisans in Kashmir. A timeless piece of luxury.'
  },
  {
    id: 4,
    name: 'Wooden Elephant Figurine',
    price: '₹899',
    image: 'https://picsum.photos/600/400?random=4',
    hint: 'wooden elephant',
    tags: ['Hand-carved', 'Decor'],
    description: 'A charming wooden elephant, hand-carved from a single block of wood. Symbolizes strength and good fortune.'
  },
  {
    id: 5,
    name: 'Jaipuri Blue Pottery Plate',
    price: '₹1,599',
    image: 'https://picsum.photos/600/400?random=5',
    hint: 'blue pottery',
    tags: ['Ceramic', 'Decorative'],
    description: 'A stunning decorative plate made using the famous Jaipuri blue pottery technique. Features a beautiful floral design.'
  },
  {
    id: 6,
    name: 'Kalamkari Fabric',
    price: '₹1,899',
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

    const handleAddToCart = (productName: string) => {
        if (!user) {
            toast({
                title: 'Please Sign In',
                description: 'You need to be logged in to add items to the cart.',
                action: <Button onClick={() => router.push('/auth')}>Sign In</Button>
            });
        } else {
            toast({
                title: 'Added to Cart!',
                description: `${productName} has been added to your cart.`
            });
        }
    }

  return (
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
            <Button className="w-full" onClick={() => handleAddToCart(product.name)}>
              <ShoppingCart className="mr-2" />
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
