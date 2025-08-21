'use server';

/**
 * @fileOverview Generates cultural insights about a craft, including its origins and history.
 *
 * - getCulturalInsights - A function that retrieves cultural insights for a given craft.
 * - CulturalInsightsInput - The input type for the getCulturalInsights function.
 * - CulturalInsightsOutput - The return type for the getCulturalInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CulturalInsightsInputSchema = z.object({
  craftName: z.string().describe('The name of the craft to get cultural insights for.'),
  language: z.string().describe('The language in which to generate the cultural insights.  Should be a 2-letter ISO language code.'),
});
export type CulturalInsightsInput = z.infer<typeof CulturalInsightsInputSchema>;

const CulturalInsightsOutputSchema = z.object({
  culturalInsights: z.string().describe('AI-generated cultural insights about the craft, including its origins and history.'),
});
export type CulturalInsightsOutput = z.infer<typeof CulturalInsightsOutputSchema>;

export async function getCulturalInsights(input: CulturalInsightsInput): Promise<CulturalInsightsOutput> {
  return culturalInsightsFlow(input);
}

const culturalInsightsPrompt = ai.definePrompt({
  name: 'culturalInsightsPrompt',
  input: {schema: CulturalInsightsInputSchema},
  output: {schema: CulturalInsightsOutputSchema},
  prompt: `You are an expert in cultural heritage and history.  Provide detailed and engaging cultural insights about the following craft, including its origins and history.  Answer in {{language}}.

Craft: {{craftName}}`,
});

const culturalInsightsFlow = ai.defineFlow(
  {
    name: 'culturalInsightsFlow',
    inputSchema: CulturalInsightsInputSchema,
    outputSchema: CulturalInsightsOutputSchema,
  },
  async input => {
    const {output} = await culturalInsightsPrompt(input);
    return output!;
  }
);
