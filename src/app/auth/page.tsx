
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import { Mail, Phone, KeyRound } from 'lucide-react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Successfully signed in with Google.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Sign-In Error', description: error.message });
    }
  };

  const handleEmailSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: 'Account created successfully.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sign-Up Error', description: error.message });
    }
  };

  const handleEmailSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Successfully signed in.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sign-In Error', description: error.message });
    }
  };

  const handlePhoneSignIn = async () => {
    try {
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;
        const result = await signInWithPhoneNumber(auth, `+${phoneNumber}`, appVerifier);
        setConfirmationResult(result);
        setOtpSent(true);
        toast({ title: 'OTP sent successfully.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Phone Sign-In Error', description: error.message });
        console.error(error);
    }
  };

  const handleOtpVerify = async () => {
    if (!confirmationResult) return;
    try {
      await confirmationResult.confirm(otp);
      toast({ title: 'Successfully signed in with Phone.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'OTP Verification Error', description: error.message });
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
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>
              <TabsContent value="email" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleEmailSignIn} className="w-full">
                        <Mail className="mr-2" /> Sign In
                    </Button>
                    <Button onClick={handleEmailSignUp} variant="secondary" className="w-full">
                        Sign Up
                    </Button>
                </div>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>
                <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177 62.2l-67.5 64.9C293.7 99.6 270.9 88 248 88c-73.2 0-132.3 59.2-132.3 168s59.1 168 132.3 168c78.8 0 110.9-61.2 114.9-94.2H248v-76h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                    Sign in with Google
                </Button>
              </TabsContent>
              <TabsContent value="phone" className="space-y-4 pt-4">
                {!otpSent ? (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. 15551234567" />
                            <p className="text-xs text-muted-foreground">Include country code without the '+' sign.</p>
                        </div>
                        <Button onClick={handlePhoneSignIn} className="w-full">
                            <Phone className="mr-2" /> Send OTP
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="otp">Enter OTP</Label>
                            <Input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
                        </div>
                        <Button onClick={handleOtpVerify} className="w-full">
                            <KeyRound className="mr-2" /> Verify OTP
                        </Button>
                    </>
                )}
              </TabsContent>
            </Tabs>
            <div id="recaptcha-container"></div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        confirmationResult: ConfirmationResult;
    }
}
