
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Loader2, Camera, CheckCircle, XCircle, AlertTriangle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { verifyArtisanIdentity, type VerifyArtisanIdentityOutput } from '@/ai/flows/verify-artisan-identity';

type VerificationState = 'idle' | 'requesting' | 'streaming' | 'capturing' | 'verifying' | 'verified' | 'flagged' | 'mismatch' | 'error';

export default function VerifyIdentityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [verificationState, setVerificationState] = useState<VerificationState>('idle');
  const [error, setError] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (hasCameraPermission === null) {
        setVerificationState('requesting');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setVerificationState('streaming');
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          setError('Camera access was denied. Please enable camera permissions in your browser settings to continue.');
          setVerificationState('error');
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this app.',
          });
        }
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup: stop video stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [hasCameraPermission, toast]);

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current || !user) {
      toast({ variant: 'destructive', title: 'Component not ready' });
      return;
    }
    setVerificationState('capturing');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const photoDataUri = canvas.toDataURL('image/jpeg');

    setVerificationState('verifying');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
        });
      });
      
      const { latitude, longitude } = position.coords;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User profile not found.");
      }
      const declaredCity = userDoc.data().city;

      const result: VerifyArtisanIdentityOutput = await verifyArtisanIdentity({
        photoDataUri,
        latitude,
        longitude,
        declaredCity
      });

      await updateDoc(userDocRef, {
        verificationStatus: result.status,
        resolvedCity: result.resolvedCity,
        lastChecked: new Date(),
        verificationMismatchReason: result.mismatchReason || null,
      });

      setVerificationState(result.status);

    } catch (err: any) {
      console.error('Verification failed:', err);
      setError(err.message || 'An unknown error occurred during verification.');
      setVerificationState('error');
      toast({ variant: 'destructive', title: 'Verification Failed', description: err.message });
    }
  };
  
   const handleContactSupport = () => {
    const subject = `Artisan Verification Issue for User: ${user?.uid}`;
    const body = `Hi ArtVaani Support,\n\nI'm encountering an issue with my location verification. Please assist.\n\nUser ID: ${user?.uid}\n\nThank you,`;
    window.location.href = `mailto:theteamvantablack@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const renderContent = () => {
    switch(verificationState) {
        case 'idle':
        case 'requesting':
            return <div className="text-center"><Loader2 className="mx-auto size-12 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Requesting permissions...</p></div>;
        case 'streaming':
            return (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-center text-muted-foreground">Position your face in the frame and capture your photo.</p>
                    <video ref={videoRef} className="w-full max-w-md aspect-video rounded-md scale-x-[-1]" autoPlay muted />
                    <Button onClick={captureAndVerify} size="lg">
                        <Camera className="mr-2"/> Capture Photo & Verify
                    </Button>
                </div>
            )
        case 'capturing':
        case 'verifying':
            return <div className="text-center"><Loader2 className="mx-auto size-12 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Verifying your identity... Do not close this page.</p></div>;
        case 'verified':
            return (
                <div className="text-center space-y-4">
                    <CheckCircle className="mx-auto size-16 text-green-500"/>
                    <h2 className="text-2xl font-bold">Verification Successful!</h2>
                    <p>You are now a verified artisan. You can now add products to your profile.</p>
                    <Button onClick={() => router.push('/dashboard/add-product')}>Add Your First Product</Button>
                </div>
            )
        case 'flagged':
            return (
                <div className="text-center space-y-4">
                    <AlertTriangle className="mx-auto size-16 text-amber-500"/>
                    <h2 className="text-2xl font-bold">Verification Pending</h2>
                    <p>Your location seems slightly different from your declared city. Our team will review your profile within 24 hours. Please check back later.</p>
                     <Button onClick={handleContactSupport}>
                        <Mail className="mr-2"/> Contact Support
                    </Button>
                </div>
            )
        case 'mismatch':
             return (
                <div className="text-center space-y-4">
                    <XCircle className="mx-auto size-16 text-destructive"/>
                    <h2 className="text-2xl font-bold">Verification Failed</h2>
                    <p>We could not verify your location. The location from your photo does not match your profile's city. Please ensure you are in your declared city and try again, or contact support if you believe this is an error.</p>
                     <Button onClick={handleContactSupport}>
                        <Mail className="mr-2"/> Contact Support
                    </Button>
                </div>
            )
        case 'error':
             return (
                <Alert variant="destructive">
                    <AlertTriangle/>
                    <AlertTitle>An Error Occurred</AlertTitle>
                    <AlertDescription>
                        {error}
                         <Button variant="link" onClick={handleContactSupport} className="p-1">Contact support if this issue persists.</Button>
                    </AlertDescription>
                </Alert>
             )
    }
  }


  if (authLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="size-12 animate-spin text-primary" /></div>;
  }
  
  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Artisan Identity Verification</CardTitle>
            <CardDescription>To ensure authenticity, we need to verify your identity by capturing a live photo and your current location.</CardDescription>
        </CardHeader>
        <CardContent>
            {renderContent()}
            <canvas ref={canvasRef} className="hidden"></canvas>
        </CardContent>
    </Card>
  )
}
