'use server';

/**
 * @fileOverview A product listing AI agent.
 *
 * - generateProductListing - A function that handles the product listing generation process.
 * - GenerateProductListingInput - The input type for the generateProductListing function.
 * - GenerateProductListingOutput - The return type for the generateProductListing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductListingInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('A detailed description of the product.'),
  language: z
    .string()
    .describe(
      'The language to generate the product listing in. Supported languages: Hindi (hi-IN), Bengali (bn-IN), Telugu (te-IN), Marathi (mr-IN), Tamil (ta-IN), Kannada (ka-IN), English (en).'
    )
    .default('en'),
  targetAudience: z.string().describe('Description of the target audience.'),
});
export type GenerateProductListingInput = z.infer<typeof GenerateProductListingInputSchema>;

const GenerateProductListingOutputSchema = z.object({
  title: z.string().describe('A compelling title for the product listing.'),
  description: z.string().describe('A detailed and engaging description of the product.'),
  hashtags: z.string().describe('Relevant hashtags for the product listing.'),
});
export type GenerateProductListingOutput = z.infer<typeof GenerateProductListingOutputSchema>;

export async function generateProductListing(
  input: GenerateProductListingInput
): Promise<GenerateProductListingOutput> {
  return generateProductListingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductListingPrompt',
  input: {schema: GenerateProductListingInputSchema},
  output: {schema: GenerateProductListingOutputSchema},
  prompt: `You are an AI assistant specializing in creating product listings for artisans.

  Given the following product information, generate a compelling product title, description, and relevant hashtags in the specified language for the target audience. The listing should be optimized for online marketplaces and social media.

  Product Name: {{{productName}}}
  Product Description: {{{productDescription}}}
  Language: {{{language}}}
  Target Audience: {{{targetAudience}}}
  
  Ensure the description is engaging and highlights the unique aspects of the product.
  Include popular and trending hashtags that would increase visibility.

  Output the title, description, and hashtags in a JSON format.
`,
});

const generateProductListingFlow = ai.defineFlow(
  {
    name: 'generateProductListingFlow',
    inputSchema: GenerateProductListingInputSchema,
    outputSchema: GenerateProductListingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
