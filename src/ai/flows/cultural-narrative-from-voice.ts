'use server';
/**
 * @fileOverview Converts artisan voice recordings into engaging cultural narratives.
 *
 * - createCulturalNarrative - A function that handles the conversion of voice to text and generates cultural narratives.
 * - CulturalNarrativeInput - The input type for the createCulturalNarrative function.
 * - CulturalNarrativeOutput - The return type for the createCulturalNarrative function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const CulturalNarrativeInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'Artisan voice recording as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'  
    ),
  language: z
    .string()
    .describe(
      'The language to generate the cultural narrative in (e.g., hi-IN, bn-IN, te-IN, mr-IN, ta-IN, ka-IN).'
    ),
});
export type CulturalNarrativeInput = z.infer<typeof CulturalNarrativeInputSchema>;

const CulturalNarrativeOutputSchema = z.object({
  narrative: z
    .string()
    .describe('The generated cultural narrative in the specified language.'),
});
export type CulturalNarrativeOutput = z.infer<typeof CulturalNarrativeOutputSchema>;

export async function createCulturalNarrative(
  input: CulturalNarrativeInput
): Promise<CulturalNarrativeOutput> {
  return culturalNarrativeFromVoiceFlow(input);
}

const ttsPrompt = ai.definePrompt({
  name: 'audioToTextPrompt',
  input: {
    schema: z.object({
      audioDataUri: z.string(),
    }),
  },
  output: {
    schema: z.object({text: z.string()}),
  },
  prompt: 'Transcribe the following audio recording to text: {{media url=audioDataUri}}',
});

const narrativePrompt = ai.definePrompt({
  name: 'culturalNarrativePrompt',
  input: {
    schema: z.object({
      transcription: z.string().describe('The transcription of the artisan voice recording.'),
      language: z.string().describe('The language to generate the cultural narrative in.'),
    }),
  },
  output: {schema: CulturalNarrativeOutputSchema},
  prompt: `You are a storytelling assistant helping artisans create engaging cultural narratives.
  Convert the artisan's voice recording transcription into a cultural narrative in the specified language.
  Transcription: {{{transcription}}}
  Language: {{{language}}}
  Narrative:`,
});


const culturalNarrativeFromVoiceFlow = ai.defineFlow(
  {
    name: 'culturalNarrativeFromVoiceFlow',
    inputSchema: CulturalNarrativeInputSchema,
    outputSchema: CulturalNarrativeOutputSchema,
  },
  async input => {
    // Convert audio to text
    console.log('Converting audio to text...');
    const {output: ttsOutput} = await ttsPrompt({
      audioDataUri: input.audioDataUri,
    });
    const transcription = ttsOutput?.text;
    console.log(`Transcription: ${transcription}`);

    if (!transcription) {
      throw new Error('Could not convert audio to text.');
    }

    // Generate cultural narrative
    console.log('Generating cultural narrative...');
    const {output: narrativeOutput} = await narrativePrompt({
      transcription: transcription,
      language: input.language,
    });

    if (!narrativeOutput?.narrative) {
      throw new Error('Could not generate cultural narrative.');
    }

    console.log(`Narrative: ${narrativeOutput.narrative}`);
    return {
      narrative: narrativeOutput.narrative,
    };
  }
);
