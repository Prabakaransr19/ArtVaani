
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/app/dashboard/products/page';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const addProduct = (product: Product) => {
    setProducts(prevProducts => [product, ...prevProducts]);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

    