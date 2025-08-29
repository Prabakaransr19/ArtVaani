
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateProductListing, type GenerateProductListingOutput } from '@/ai/flows/generate-product-listing';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { languages } from '@/lib/languages';
import { Wand2, Loader2, Copy, Send } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

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
  const { language, translations } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { language: language },
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

  const handlePostProduct = () => {
    // Placeholder for actual product posting logic
    toast({
      title: 'Product Posted!',
      description: 'Your product has been successfully posted.',
    });
  };
  
  const t = translations.productListing;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t.generator.title}</CardTitle>
          <CardDescription>{t.generator.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="productName">{t.generator.productName.label}</Label>
              <Input id="productName" {...register('productName')} placeholder={t.generator.productName.placeholder} />
              {errors.productName && <p className="text-sm text-destructive">{errors.productName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="productDescription">{t.generator.productDescription.label}</Label>
              <Textarea id="productDescription" {...register('productDescription')} placeholder={t.generator.productDescription.placeholder} rows={5} />
              {errors.productDescription && <p className="text-sm text-destructive">{errors.productDescription.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">{t.generator.targetAudience.label}</Label>
              <Input id="targetAudience" {...register('targetAudience')} placeholder={t.generator.targetAudience.placeholder} />
              {errors.targetAudience && <p className="text-sm text-destructive">{errors.targetAudience.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t.generator.language.label}</Label>
              <Select
                onValueChange={(value) => {
                  setValue('language', value);
                  trigger('language');
                }}
                defaultValue={language}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder={t.generator.language.placeholder} />
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
              {t.generator.button}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>{t.generated.title}</CardTitle>
          <CardDescription>{t.generated.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 flex-1">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="size-12 animate-spin text-primary" />
              <p className="text-muted-foreground">{t.generated.loading}</p>
            </div>
          )}
          {generatedListing ? (
            <>
              <div className="space-y-2">
                <Label>{t.generated.generatedTitle}</Label>
                <div className="relative">
                  <Input readOnly value={generatedListing.title} className="pr-10" />
                  <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7" onClick={() => handleCopyToClipboard(generatedListing.title)}><Copy className="size-4"/></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.generated.generatedDescription}</Label>
                 <div className="relative">
                  <Textarea readOnly value={generatedListing.description} rows={8} className="pr-10" />
                  <Button variant="ghost" size="icon" className="absolute top-2 right-1 h-7 w-7" onClick={() => handleCopyToClipboard(generatedListing.description)}><Copy className="size-4"/></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.generated.generatedHashtags}</Label>
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
                <p>{t.generated.placeholder}</p>
              </div>
            )
          )}
        </CardContent>
        {generatedListing && !isLoading && (
            <CardFooter>
                <Button onClick={handlePostProduct} className="w-full">
                    <Send className="mr-2" />
                    {t.generated.postButton}
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
