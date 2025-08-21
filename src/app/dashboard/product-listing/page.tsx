'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateProductListing, type GenerateProductListingOutput } from '@/ai/flows/generate-product-listing';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { languages } from '@/lib/languages';
import { Wand2, Loader2, Copy } from 'lucide-react';

const formSchema = z.object({
  productName: z.string().min(3, 'Product name must be at least 3 characters long.'),
  productDescription: z.string().min(10, 'Product description must be at least 10 characters long.'),
  targetAudience: z.string().min(3, 'Target audience must be at least 3 characters long.'),
  language: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProductListingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedListing, setGeneratedListing] = useState<GenerateProductListingOutput | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { language: 'en' },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setGeneratedListing(null);
    try {
      const result = await generateProductListing(data);
      setGeneratedListing(result);
    } catch (error) {
      console.error('Error generating product listing:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the product listing. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Listing Generator</CardTitle>
          <CardDescription>Fill in your product details and let AI do the writing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input id="productName" {...register('productName')} placeholder="e.g., Hand-painted Terracotta Vase" />
              {errors.productName && <p className="text-sm text-destructive">{errors.productName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="productDescription">Product Description</Label>
              <Textarea id="productDescription" {...register('productDescription')} placeholder="Describe the materials, dimensions, and story behind your product." rows={5} />
              {errors.productDescription && <p className="text-sm text-destructive">{errors.productDescription.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input id="targetAudience" {...register('targetAudience')} placeholder="e.g., Home decor enthusiasts, art collectors" />
              {errors.targetAudience && <p className="text-sm text-destructive">{errors.targetAudience.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                onValueChange={(value) => {
                  setValue('language', value);
                  trigger('language');
                }}
                defaultValue="en"
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
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
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Wand2 className="mr-2" />
              )}
              Generate Listing
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Content</CardTitle>
          <CardDescription>Review the AI-generated content below. Copy and use it in your listings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="size-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Generating your listing...</p>
            </div>
          )}
          {generatedListing ? (
            <>
              <div className="space-y-2">
                <Label>Generated Title</Label>
                <div className="relative">
                  <Input readOnly value={generatedListing.title} className="pr-10" />
                  <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7" onClick={() => handleCopyToClipboard(generatedListing.title)}><Copy className="size-4"/></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Generated Description</Label>
                 <div className="relative">
                  <Textarea readOnly value={generatedListing.description} rows={8} className="pr-10" />
                  <Button variant="ghost" size="icon" className="absolute top-2 right-1 h-7 w-7" onClick={() => handleCopyToClipboard(generatedListing.description)}><Copy className="size-4"/></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Generated Hashtags</Label>
                 <div className="relative">
                  <Input readOnly value={generatedListing.hashtags} className="pr-10"/>
                  <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7" onClick={() => handleCopyToClipboard(generatedListing.hashtags)}><Copy className="size-4"/></Button>
                </div>
              </div>
            </>
          ) : (
            !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Wand2 className="size-12 mb-4"/>
                <p>Your generated content will appear here.</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
