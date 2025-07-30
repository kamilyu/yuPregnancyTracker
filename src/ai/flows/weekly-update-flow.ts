
'use server';
/**
 * @fileOverview A flow for generating weekly pregnancy updates.
 *
 * - getWeeklyUpdate - A function that generates a development update for a given week of pregnancy.
 * - WeeklyUpdateInput - The input type for the getWeeklyUpdate function.
 * - WeeklyUpdateOutput - The return type for the getWeeklyUpdate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const WeeklyUpdateInputSchema = z.object({
  week: z.number().min(1).max(42).describe('The current week of pregnancy.'),
});
export type WeeklyUpdateInput = z.infer<typeof WeeklyUpdateInputSchema>;

export const WeeklyUpdateOutputSchema = z.object({
    title: z.string().describe("A catchy, exciting title for the weekly update. Should include the week number."),
    description: z.string().describe("A detailed, yet easy-to-understand summary of the baby's development for the given week. Should be a paragraph of 3-5 sentences. It should be scientifically-backed, covering growth milestones, organ development, and expected changes."),
});
export type WeeklyUpdateOutput = z.infer<typeof WeeklyUpdateOutputSchema>;

const prompt = ai.definePrompt({
    name: 'weeklyUpdatePrompt',
    input: { schema: WeeklyUpdateInputSchema },
    output: { schema: WeeklyUpdateOutputSchema },
    prompt: `You are a helpful, friendly, and knowledgeable assistant for expectant parents.
    Generate a weekly development update for a pregnant user who is in week {{{week}}} of their pregnancy.
    
    Provide scientifically verified details about the baby's growth milestones, organ development, and any other expected changes for this specific week.
    The tone should be positive, reassuring, and exciting.
    `,
});

const weeklyUpdateFlow = ai.defineFlow(
  {
    name: 'weeklyUpdateFlow',
    inputSchema: WeeklyUpdateInputSchema,
    outputSchema: WeeklyUpdateOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function getWeeklyUpdate(input: WeeklyUpdateInput): Promise<WeeklyUpdateOutput> {
    return await weeklyUpdateFlow(input);
}
