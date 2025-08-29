
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PartyPopper, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function CheckoutPage() {
    const { translations } = useLanguage();
    const t = translations.checkout;
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
            <PartyPopper className="size-12" />
          </div>
          <CardTitle className="mt-4">{t.title}</CardTitle>
          <CardDescription>{t.dummyMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="mr-2" />
              {t.backToShopping}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
