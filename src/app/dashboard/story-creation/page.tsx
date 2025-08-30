
'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { createStoryFromAudio } from '@/ai/flows/story-creation';
import { languages } from '@/lib/languages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Mic, Square, Sparkles, Copy, BookOpen } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { Volume2 } from 'lucide-react';


export default function StoryCreationPage() {
    const { toast } = useToast();
    const { language, translations } = useLanguage();
    const { speak, isSpeaking } = useTextToSpeech();

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedStory, setGeneratedStory] = useState<{transcription: string; story: string} | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const t = translations.storyCreation;

    const startRecording = async () => {
        setAudioBlob(null);
        setGeneratedStory(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.addEventListener('dataavailable', (event) => audioChunksRef.current.push(event.data));
            mediaRecorderRef.current.addEventListener('stop', () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                toast({ title: t.recording.success });
            });
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            toast({ variant: 'destructive', title: t.recording.error });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleGenerateStory = async () => {
        if (!audioBlob) {
            toast({ variant: 'destructive', title: t.story.noAudioError });
            return;
        }

        setIsLoading(true);
        setGeneratedStory(null);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                const result = await createStoryFromAudio({
                    audioDataUri: base64Audio,
                    language: language,
                });
                setGeneratedStory(result);
            };
        } catch (error) {
            console.error('Error generating story:', error);
            toast({ variant: 'destructive', title: t.story.generationError });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: t.story.copied });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t.title}</CardTitle>
                    <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <p className="text-sm text-center text-muted-foreground">{t.instructions}</p>
                    <Button
                        size="lg"
                        variant={isRecording ? 'destructive' : 'outline'}
                        onClick={isRecording ? stopRecording : startRecording}
                        className="w-48"
                    >
                        {isRecording ? <Square className="mr-2" /> : <Mic className="mr-2" />}
                        {isRecording ? t.recording.stop : t.recording.start}
                    </Button>
                    {audioBlob && (
                         <div className="text-center text-green-600 font-semibold">{t.recording.ready}</div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGenerateStory} disabled={!audioBlob || isLoading} className="w-full">
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" />{t.story.button}</>}
                    </Button>
                </CardFooter>
            </Card>
            
             {isLoading && (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <Loader2 className="size-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">{t.story.loading}</p>
                </div>
            )}

            {generatedStory && (
                <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>{t.story.generatedTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                             <Label>{t.story.transcription}</Label>
                             <Textarea value={generatedStory.transcription} readOnly rows={3} className="bg-muted/50"/>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>{t.story.narrative}</Label>
                                <div className="flex gap-2">
                                     <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => speak(generatedStory.story, language)}
                                        disabled={isSpeaking}
                                    >
                                        <Volume2 className={`size-4 ${isSpeaking ? 'text-primary' : ''}`} />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(generatedStory.story)}>
                                        <Copy className="size-4" />
                                    </Button>
                                </div>
                            </div>
                            <Textarea value={generatedStory.story} readOnly rows={10} className="leading-relaxed"/>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!generatedStory && !isLoading && (
                <div className="text-center py-16 text-muted-foreground">
                    <BookOpen className="mx-auto size-12 mb-4" />
                    <h3 className="text-lg font-semibold">{t.story.placeholder.title}</h3>
                    <p>{t.story.placeholder.description}</p>
                </div>
            )}
        </div>
    )
}
