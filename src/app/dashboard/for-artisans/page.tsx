
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useLanguage } from '@/context/language-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Paintbrush } from 'lucide-react';

const formSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  city: z.string().min(2, 'City is required.'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number.'),
  artType: z.string().min(3, 'Please describe your art.'),
  experience: z.string().min(1, 'Please enter your years of experience.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForArtisansPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { translations } = useLanguage();
  const t = translations.forArtisans;

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

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
            if (data.isArtisan) {
                // Already an artisan, redirect to dashboard
                router.replace('/dashboard');
                return;
            }
            setValue('fullName', data.displayName || user.displayName || '');
            setValue('city', data.city || '');
            setValue('phoneNumber', data.phoneNumber || user.phoneNumber || '');
        } else {
            setValue('fullName', user.displayName || '');
            setValue('phoneNumber', user.phoneNumber || '');
        }
        setIsPageLoading(false);
    }

    fetchUserData();
  }, [user, authLoading, router, setValue]);


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: data.fullName });

      // Save additional details in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: data.fullName,
        city: data.city,
        phoneNumber: data.phoneNumber,
        isArtisan: true,
        artType: data.artType,
        experience: data.experience,
      }, { merge: true });

      toast({ title: t.success.title, description: t.success.description });
      router.push('/dashboard');
      // A hard refresh might be needed to update the sidebar correctly
      router.refresh(); 
    } catch (error: any) {
      console.error('Error updating artisan profile:', error);
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
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                <Paintbrush className="size-10" />
            </div>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">{t.form.fullName.label}</Label>
                    <Input id="fullName" {...register('fullName')} />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
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
                    <Input id="artType" {...register('artType')} placeholder={t.form.artType.placeholder} />
                    {errors.artType && <p className="text-sm text-destructive">{errors.artType.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="experience">{t.form.experience.label}</Label>
                    <Input id="experience" {...register('experience')} placeholder={t.form.experience.placeholder} />
                    {errors.experience && <p className="text-sm text-destructive">{errors.experience.message}</p>}
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : t.button}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}

