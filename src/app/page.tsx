import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-2xl">
        <Logo className="h-24 w-auto text-primary" />
        <h1 className="text-5xl md:text-7xl font-headline text-foreground">
          ArtVaani
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Empowering artisans by giving a voice to their craft. Discover unique stories and handmade products from across India.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="shadow-lg">
            <Link href="/dashboard">
              Enter the Marketplace <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ArtVaani. All rights reserved.</p>
      </footer>
    </main>
  );
}
