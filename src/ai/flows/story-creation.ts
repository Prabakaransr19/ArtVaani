
'use server';
/**
 * @fileOverview A flow for transcribing audio and creating a cultural story from it.
 *
 * - createStoryFromAudio - A function that handles the story creation process.
 * - StoryCreationInput - The input type for the createStoryFromAudio function.
 * - StoryCreationOutput - The return type for the createStoryFromAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema for the story creation flow
const StoryCreationInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The user's audio recording, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  language: z
    .string()
    .describe('The language of the audio and the desired output story language.'),
});
export type StoryCreationInput = z.infer<typeof StoryCreationInputSchema>;

// Define the output schema for the story creation flow
const StoryCreationOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
  story: z
    .string()
    .describe('The generated cultural narrative based on the transcription.'),
});
export type StoryCreationOutput = z.infer<typeof StoryCreationOutputSchema>;

export async function createStoryFromAudio(
  input: StoryCreationInput
): Promise<StoryCreationOutput> {
  return storyCreationFlow(input);
}

// Define the prompt for generating the story from the transcription
const storyPrompt = ai.definePrompt({
  name: 'storyPrompt',
  input: {
    schema: z.object({
      transcription: z.string(),
      language: z.string(),
    }),
  },
  output: { schema: z.object({ story: z.string() }) },
  prompt: `You are a masterful storyteller who specializes in cultural narratives.
  An artisan has provided the following text, which was transcribed from their voice.
  Your task is to transform this raw transcription into a beautiful, engaging, and culturally rich story.
  The story should capture the essence of the artisan's message, their craft, and their heritage.
  Write the story in the following language: {{language}}.

  Transcription:
  {{{transcription}}}
  `,
});

// Define the main flow for story creation
const storyCreationFlow = ai.defineFlow(
  {
    name: 'storyCreationFlow',
    inputSchema: StoryCreationInputSchema,
    outputSchema: StoryCreationOutputSchema,
  },
  async ({ audioDataUri, language }) => {
    // 1. Transcribe the audio
    const { text: transcription } = await ai.generate({
      model: 'gemini-2.0-flash', // Or another suitable model
      prompt: [
        {
          media: {
            url: audioDataUri,
          },
        },
        {
          text: `Transcribe the following audio recording. The language is ${language}.`,
        },
      ],
    });

    if (!transcription) {
      throw new Error('Audio transcription failed.');
    }

    // 2. Generate the story from the transcription
    const { output: storyOutput } = await storyPrompt({
      transcription,
      language,
    });

    if (!storyOutput) {
      throw new Error('Story generation failed.');
    }

    return {
      transcription: transcription,
      story: storyOutput.story,
    };
  }
);
