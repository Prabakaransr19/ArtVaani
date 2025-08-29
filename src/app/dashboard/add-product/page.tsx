
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { generateProductListing, type GenerateProductListingOutput } from '@/ai/flows/generate-product-listing';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, Send, LogIn, Upload, Mic, Square } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  description: z.string().min(10, 'Please provide a description of at least 10 characters.'),
  targetAudience: z.string().min(3, 'Target audience must be at least 3 characters long.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedListing, setGeneratedListing] = useState<GenerateProductListingOutput | null>(null);
  const [productImage, setProductImage] = useState<{ file: File, preview: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [step, setStep] = useState(1);

  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { description: '', targetAudience: '' },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImage({ file, preview: URL.createObjectURL(file) });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => audioChunksRef.current.push(event.data));
      mediaRecorderRef.current.addEventListener('stop', () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setValue('description', '[Voice recording attached]');
          toast({ title: 'Voice note recorded!' });
        };
      });
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Microphone access denied.' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!productImage) {
      toast({ variant: 'destructive', title: 'Product image is required.' });
      return;
    }
    setIsLoading(true);
    setGeneratedListing(null);

    const reader = new FileReader();
    reader.readAsDataURL(productImage.file);
    reader.onloadend = async () => {
        const base64Image = reader.result as string;
        try {
            const result = await generateProductListing({
              ...data,
              language: language,
              photoDataUri: base64Image,
            });
            setGeneratedListing(result);
            setStep(2); // Move to the editing step
        } catch (error) {
            console.error('Error generating product listing:', error);
            toast({ variant: 'destructive', title: 'Generation Failed' });
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handlePostProduct = async () => {
    if (!user || !generatedListing || !productImage) return;

    setIsLoading(true);
    try {
        const productsCollection = collection(db, 'products');
        await addDoc(productsCollection, {
            name: generatedListing.title,
            description: generatedListing.description,
            story: generatedListing.story,
            price: generatedListing.suggestedPrice,
            hashtags: generatedListing.hashtags,
            image: productImage.preview, // In a real app, upload to storage and save URL
            userId: user.uid,
            createdAt: serverTimestamp(),
            language: language,
        });
        toast({ title: 'Product Posted!', description: 'Your product is now live.' });
        router.push('/dashboard/products');
    } catch (error) {
        console.error("Error posting product: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not post product.' });
    } finally {
        setIsLoading(false);
    }
  };

  const t = translations.addProduct;

  if (!user) {
    return (
      <Alert>
        <LogIn className="size-4" />
        <AlertTitle>Sign in to continue</AlertTitle>
        <AlertDescription>
          Please <Link href="/auth" className="font-bold underline">sign in</Link> to add a product.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        {step === 1 && (
            <Card>
                <CardHeader>
                    <CardTitle>{t.generator.title}</CardTitle>
                    <CardDescription>{t.generator.description}</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="productImage">1. Upload Product Image</Label>
                            <Input id="productImage" type="file" accept="image/*" onChange={handleImageChange} className="file:text-primary file:font-semibold"/>
                            {productImage && (
                                <div className="mt-4 relative w-48 h-48 rounded-md overflow-hidden ring-2 ring-primary/50">
                                    <Image src={productImage.preview} alt="Product preview" fill className="object-cover" />
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                           <Label htmlFor="productDescription">2. Describe Your Product (Text or Voice)</Label>
                            <div className="flex gap-2">
                                <Textarea id="productDescription" {...register('description')} placeholder={t.generator.productDescription.placeholder} rows={3} className="flex-grow" />
                                <Button type="button" variant={isRecording ? 'destructive' : 'outline'} size="icon" onClick={isRecording ? stopRecording : startRecording}>
                                    {isRecording ? <Square/> : <Mic />}
                                </Button>
                            </div>
                            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetAudience">3. Who is this for?</Label>
                            <Input id="targetAudience" {...register('targetAudience')} placeholder={t.generator.targetAudience.placeholder} />
                            {errors.targetAudience && <p className="text-sm text-destructive">{errors.targetAudience.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={isLoading || !productImage} className="w-full">
                            {isLoading ? <Loader2 className="animate-spin" /> : <><Wand2 className="mr-2" /> Generate Listing with AI</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        )}

        {step === 2 && generatedListing && (
            <Card>
                 <CardHeader>
                    <CardTitle>Review & Refine Your Listing</CardTitle>
                    <CardDescription>The AI has generated the content below. Edit it as you see fit, then post your product.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-6">
                    <div className="flex gap-6 flex-col md:flex-row">
                        {productImage && (
                            <div className="relative w-full md:w-1/3 aspect-square rounded-md overflow-hidden">
                                <Image src={productImage.preview} alt="Product" fill className="object-cover" />
                            </div>
                        )}
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={generatedListing.title} onChange={(e) => setGeneratedListing({...generatedListing, title: e.target.value})} />
                            </div>
                             <div className="space-y-2">
                                <Label>Suggested Price</Label>
                                <Input value={generatedListing.suggestedPrice} onChange={(e) => setGeneratedListing({...generatedListing, suggestedPrice: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={generatedListing.description} rows={5} onChange={(e) => setGeneratedListing({...generatedListing, description: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Story</Label>
                        <Textarea value={generatedListing.story} rows={5} onChange={(e) => setGeneratedListing({...generatedListing, story: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label>Hashtags</Label>
                        <Input value={generatedListing.hashtags} onChange={(e) => setGeneratedListing({...generatedListing, hashtags: e.target.value})} />
                    </div>
                 </CardContent>
                 <CardFooter className="flex justify-between">
                     <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={handlePostProduct} disabled={isLoading}>
                         {isLoading ? <Loader2 className="animate-spin" /> : <><Send className="mr-2" /> Post Product</>}
                    </Button>
                 </CardFooter>
            </Card>
        )}
    </div>
  );
}
