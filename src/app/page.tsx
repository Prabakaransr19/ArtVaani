
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ArrowRight } from 'lucide-react';
import { languages } from '@/lib/languages';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const { language, setLanguage, translations } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        <Logo className="h-24 w-auto text-primary" />
        <h1 className="text-5xl md:text-7xl font-headline text-foreground">
          ArtVaani
        </h1>
        <Card className="w-full mt-8">
            <CardHeader className="text-center">
                <CardTitle>{translations.languageSelector.title}</CardTitle>
                <CardDescription>{translations.languageSelector.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="language">{translations.languageSelector.label}</Label>
                    <Select onValueChange={setLanguage} defaultValue={language}>
                        <SelectTrigger id="language">
                            <SelectValue placeholder={translations.languageSelector.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleContinue} className="w-full">
                    {translations.languageSelector.button} <ArrowRight className="ml-2" />
                </Button>
            </CardFooter>
        </Card>
      </div>
    </main>
  );
}
