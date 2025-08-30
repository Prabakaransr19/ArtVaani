
'use server';

/**
 * @fileOverview An AI flow to verify an artisan's identity by comparing their live photo location with their declared city.
 *
 * - verifyArtisanIdentity - A function that handles the artisan identity verification process.
 * - VerifyArtisanIdentityInput - The input type for the verifyArtisanIdentity function.
 * - VerifyArtisanIdentityOutput - The return type for the verifyArtisanIdentity function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AxiosError } from 'axios';


const VerifyArtisanIdentityInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A live photo of the artisan, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  latitude: z.number().describe('The current latitude of the artisan.'),
  longitude: z.number().describe('The current longitude of the artisan.'),
  declaredCity: z.string().describe("The artisan's declared city from their profile."),
});
export type VerifyArtisanIdentityInput = z.infer<typeof VerifyArtisanIdentityInputSchema>;

const VerifyArtisanIdentityOutputSchema = z.object({
  status: z
    .enum(['verified', 'flagged', 'mismatch'])
    .describe(
      'The result of the verification. "verified" if locations match. "flagged" for slight mismatches needing review. "mismatch" for significant differences.'
    ),
  resolvedCity: z.string().describe('The city name resolved from the GPS coordinates.'),
  mismatchReason: z.string().optional().describe('An explanation if a mismatch is detected.'),
});
export type VerifyArtisanIdentityOutput = z.infer<typeof VerifyArtisanIdentityOutputSchema>;

export async function verifyArtisanIdentity(
  input: VerifyArtisanIdentityInput
): Promise<VerifyArtisanIdentityOutput> {
  return verifyArtisanIdentityFlow(input);
}


// This is a mock service. In a real application, you would use a robust
// reverse geocoding API like Google Maps Geocoding API.
async function getCityFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
        // Using a free, public reverse geocoding service for demonstration.
        // NOTE: This has no SLA and is not suitable for production.
        // Replace with a robust service like Google Maps Geocoding API.
        const geocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        const { default: axios } = await import('axios');
        const response = await axios.get(geocodingUrl, {
            headers: {
                'User-Agent': 'ArtVaani-Verification/1.0'
            }
        });
        
        if (response.data && response.data.address) {
            const { city, town, village } = response.data.address;
            return city || town || village || 'Unknown Location';
        }
        throw new Error('Could not resolve city from coordinates.');

    } catch (error) {
         if (error instanceof AxiosError) {
             console.error("Geocoding API Error:", error.response?.data);
         } else {
             console.error("Geocoding Error:", error);
         }
        throw new Error('Failed to fetch city from coordinates.');
    }
}


const verificationPrompt = ai.definePrompt({
  name: 'artisanVerificationPrompt',
  input: { schema: z.object({
    declaredCity: z.string(),
    resolvedCity: z.string(),
    photoAnalysis: z.string(),
  })},
  output: { schema: VerifyArtisanIdentityOutputSchema },
  prompt: `You are a verification agent for an artisan marketplace called ArtVaani. Your job is to assess if an artisan's location is genuine based on three pieces of information: their declared city, their location from their device's GPS, and an AI analysis of a live photo they just took.

  **Inputs:**
  1.  **Declared City:** The city the artisan entered in their profile: \`{{{declaredCity}}}\`
  2.  **Resolved GPS City:** The city resolved from their device's GPS coordinates: \`{{{resolvedCity}}}\`
  3.  **Live Photo Analysis:** An AI's description of the photo's surroundings: \`{{{photoAnalysis}}}\`

  **Your Task:**
  Compare the **Declared City** and the **Resolved GPS City**.
  - If they are the same or obviously refer to the same major metropolitan area (e.g., "Gurgaon" and "New Delhi"), the status is **"verified"**.
  - If the cities are different but in the same state or are well-known neighboring cities (e.g., "Pune" and "Mumbai"), the status is **"flagged"**. This requires manual review. Provide a brief reason.
  - If the cities are in different states or very far apart (e.g., "Kolkata" and "Bengaluru"), the status is **"mismatch"**. Provide a brief reason.

  Use the Live Photo Analysis to add context, but base your primary decision on the city comparison.

  **Output Format:**
  Provide your response in the specified JSON format with 'status', 'resolvedCity', and 'mismatchReason' (if applicable).
  `,
});

const photoAnalysisPrompt = ai.definePrompt({
    name: 'photoAnalysisPrompt',
    input: { schema: z.object({ photoDataUri: z.string() }) },
    output: { schema: z.object({ analysis: z.string().describe("A brief description of the user's surroundings based on the photo.") }) },
    prompt: `Analyze the background of this user photo to identify clues about their location (e.g., landmarks, architecture, environment type). Provide a brief, one-sentence summary.

    Photo: {{media url=photoDataUri}}`
})


const verifyArtisanIdentityFlow = ai.defineFlow(
  {
    name: 'verifyArtisanIdentityFlow',
    inputSchema: VerifyArtisanIdentityInputSchema,
    outputSchema: VerifyArtisanIdentityOutputSchema,
  },
  async ({ photoDataUri, latitude, longitude, declaredCity }) => {

    const resolvedCity = await getCityFromCoordinates(latitude, longitude);

    const { output: photoAnalysis } = await photoAnalysisPrompt({ photoDataUri });
    
    const { output: verificationResult } = await verificationPrompt({
        declaredCity,
        resolvedCity,
        photoAnalysis: photoAnalysis?.analysis || "Could not analyze photo.",
    });

    if (!verificationResult) {
        throw new Error("Failed to get a verification result from the AI model.");
    }
    
    return verificationResult;
  }
);
