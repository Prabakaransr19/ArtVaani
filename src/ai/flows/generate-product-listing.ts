
'use server';

/**
 * @fileOverview A product listing AI agent that takes image and text/voice input to generate a complete product listing.
 *
 * - generateProductListing - A function that handles the product listing generation process.
 * - GenerateProductListingInput - The input type for the generateProductListing function.
 * - GenerateProductListingOutput - The return type for the generateProductListing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductListingInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('A brief text or transcribed voice description of the product.'),
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
  story: z.string().describe('A cultural story about the product, its origins, or the artisan.'),
  hashtags: z.string().describe("A comma-separated list of relevant tags or keywords for the product listing (e.g., 'handmade, terracotta, decorative')."),
  suggestedPrice: z.string().describe('A suggested selling price in Indian Rupees (₹), based on the product analysis. This is a suggestion, not based on real-time market data.'),
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
  prompt: `You are an AI assistant specializing in creating product listings for artisans selling on an e-commerce platform called ArtVaani.

  Your task is to generate a complete, compelling product listing based on the provided image and description. The listing should be optimized for online marketplaces and social media.

  **Instructions:**
  1.  **Analyze the Image and Description:** Carefully examine the product photo and the artisan's description.
  2.  **Generate a Title:** Create a short, catchy, and descriptive title.
  3.  **Write a Detailed Description:** Expand on the artisan's input to write an engaging marketing description. Highlight the craftsmanship, materials, and potential uses.
  4.  **Craft a Cultural Story:** Based on the product type and artisan's description, create a short, engaging story about the product's cultural significance, the artisan's journey, or the craft's history.
  5.  **Suggest Tags:** Provide a comma-separated list of popular and trending tags or keywords that would increase visibility. Do not include the '#' symbol.
  6.  **Suggest a Price:** Based on your analysis of the product's materials, complexity, and type, suggest a reasonable selling price in Indian Rupees (e.g., ₹1,499). Preface it with a short disclaimer that this is a suggestion.
  7.  **Language:** Generate all content in the specified language: {{{language}}}.
  8.  **Target Audience:** Keep the tone and style appropriate for the target audience: {{{targetAudience}}}.

  **Inputs:**
  - **Product Photo:** {{media url=photoDataUri}}
  - **Artisan's Description:** {{{description}}}
  - **Language:** {{{language}}}
  - **Target Audience:** {{{targetAudience}}}

  Output the result in the specified JSON format.
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

