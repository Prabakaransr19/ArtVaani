
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/icons';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  city: z.string().min(2, 'City is required.'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number.'),
  isArtisan: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function CompleteProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.displayName || '',
      phoneNumber: user?.phoneNumber || '',
      city: '',
      isArtisan: false,
    }
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to complete your profile.' });
      router.push('/auth');
      return;
    }

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
        isArtisan: data.isArtisan,
        createdAt: new Date(),
      }, { merge: true });

      toast({ title: 'Profile completed!', description: 'Welcome to ArtVaani!' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error completing profile:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        <Logo className="h-24 w-auto text-primary" />
        <h1 className="text-5xl md:text-7xl font-headline text-foreground">
          ArtVaani
        </h1>
        <Card className="w-full mt-8">
          <CardHeader className="text-center">
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>Just a few more details to get started.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...register('fullName')} />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" type="tel" {...register('phoneNumber')} />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isArtisan" {...register('isArtisan')} />
                <label
                  htmlFor="isArtisan"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Are you an artisan? Check here if you want to sell your products.
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Save and Continue'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
