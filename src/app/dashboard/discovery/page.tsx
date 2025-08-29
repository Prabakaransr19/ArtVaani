
'use client';

import { useState } from 'react';
import { getCulturalInsights } from '@/ai/flows/ai-cultural-insights';
import { useToast } from '@/hooks/use-toast';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { languages } from '@/lib/languages';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Volume2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function DiscoveryPage() {
  const [craftName, setCraftName] = useState('');
  const [insights, setInsights] = useState<{craft: string; text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { speak, isSpeaking } = useTextToSpeech();
  const { language, setLanguage: setContextLanguage, translations } = useLanguage();

  const handleGetInsights = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!craftName) {
        toast({ variant: 'destructive', title: 'Craft name is required.' });
        return;
    }

    setIsLoading(true);
    setInsights(null);

    try {
      const result = await getCulturalInsights({ craftName, language });
      setInsights({ craft: craftName, text: result.culturalInsights });
    } catch (error) {
      console.error('Error getting cultural insights:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Get Insights',
        description: 'Could not retrieve cultural insights. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const t = translations.discover;

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>{t.form.title}</CardTitle>
          <CardDescription>{t.form.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGetInsights} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full space-y-2">
              <Label htmlFor="craftName">{t.form.craftName.label}</Label>
              <Input
                id="craftName"
                value={craftName}
                onChange={(e) => setCraftName(e.target.value)}
                placeholder={t.form.craftName.placeholder}
              />
            </div>
            <div className="w-full sm:w-48 space-y-2">
                <Label htmlFor="language">{t.form.language.label}</Label>
                <Select onValueChange={setContextLanguage} defaultValue={language}>
                <SelectTrigger id="language">
                    <SelectValue placeholder={t.form.language.placeholder} />
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
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Search className="mr-2" />
              )}
              {t.form.button}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-48 space-y-4">
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{t.results.loading}</p>
        </div>
      )}

      {insights && (
        <Card className="animate-in fade-in-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t.results.title} {insights.craft}</CardTitle>
              <CardDescription>{t.results.description} {insights.craft}.</CardDescription>
            </div>
            <Button
                variant="outline"
                size="icon"
                onClick={() => speak(insights.text, language)}
                disabled={isSpeaking}
                aria-label={t.results.readAloud}
            >
                <Volume2 className={`size-5 ${isSpeaking ? 'text-primary' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap leading-relaxed">{insights.text}</p>
          </CardContent>
        </Card>
      )}

      {!insights && !isLoading && (
        <div className="text-center py-16 text-muted-foreground">
            <Sparkles className="mx-auto size-12 mb-4" />
            <h3 className="text-lg font-semibold">{t.placeholder.title}</h3>
            <p>{t.placeholder.description}</p>
        </div>
      )}
    </div>
  );
}
