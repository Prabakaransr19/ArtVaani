
'use client';

import { useState, useRef, useEffect } from 'react';
import { createCulturalNarrative } from '@/ai/flows/cultural-narrative-from-voice';
import { useToast } from '@/hooks/use-toast';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { languages } from '@/lib/languages';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Square, Loader2, Wand2, Volume2, Waves } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function StoryCreationPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [narrative, setNarrative] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();
  const { speak, isSpeaking } = useTextToSpeech();
  const { language, setLanguage: setContextLanguage, translations } = useLanguage();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ variant: 'destructive', title: 'Audio recording not supported in this browser.' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioURL(null);
      setNarrative('');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({ variant: 'destructive', title: 'Microphone access denied.', description: 'Please allow microphone access in your browser settings.' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // Stop all media tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleGenerateNarrative = async () => {
    if (!audioBlob) {
      toast({ variant: 'destructive', title: 'No audio recorded.', description: 'Please record your story first.' });
      return;
    }

    setIsLoading(true);
    setNarrative('');

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      try {
        const result = await createCulturalNarrative({ audioDataUri: base64Audio, language });
        setNarrative(result.narrative);
      } catch (error) {
        console.error('Error generating narrative:', error);
        toast({
          variant: 'destructive',
          title: 'Narrative Generation Failed',
          description: 'Could not generate the narrative. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
  };

  const t = translations.storyCreation;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t.assistant.title}</CardTitle>
          <CardDescription>{t.assistant.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>{t.assistant.step1}</Label>
            <Select onValueChange={setContextLanguage} defaultValue={language}>
              <SelectTrigger>
                <SelectValue placeholder={t.assistant.languagePlaceholder} />
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
          <div className="space-y-2">
            <Label>{t.assistant.step2}</Label>
            <div className='flex items-center gap-4'>
                <Button onClick={isRecording ? stopRecording : startRecording} disabled={!isClient || isLoading} className="w-40">
                {isRecording ? <><Square className="mr-2" /> {t.assistant.stopRecording}</> : <><Mic className="mr-2" /> {t.assistant.startRecording}</>}
              </Button>
              {isRecording && <Waves className="size-8 text-primary animate-pulse" />}
            </div>
            
          </div>

          {audioURL && (
            <div className="space-y-2">
              <Label>{t.assistant.yourRecording}</Label>
              <audio src={audioURL} controls className="w-full" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateNarrative} disabled={!audioURL || isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 className="mr-2" />}
            {t.assistant.generateButton}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t.narrative.title}</CardTitle>
          <CardDescription>{t.narrative.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="size-12 animate-spin text-primary" />
              <p className="text-muted-foreground">{t.narrative.loading}</p>
            </div>
          ) : narrative ? (
            <div className="relative">
                <Textarea value={narrative} readOnly rows={15} className="pr-12" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-1 h-8 w-8"
                    onClick={() => speak(narrative, language)}
                    disabled={isSpeaking}
                    aria-label={t.narrative.readAloud}
                >
                    <Volume2 className={`size-5 ${isSpeaking ? 'text-primary' : ''}`} />
                </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Mic className="size-12 mb-4"/>
                <p>{t.narrative.placeholder}</p>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
