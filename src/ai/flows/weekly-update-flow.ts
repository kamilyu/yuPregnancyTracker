
'use server';
/**
 * @fileOverview A flow for generating weekly pregnancy updates.
 *
 * - getWeeklyUpdate - A function that generates a development update for a given week of pregnancy.
 * - WeeklyUpdateInput - The input type for the getWeeklyUpdate function.
 * - WeeklyUpdateOutput - The return type for the getWeeklyUpdate function.
 */

import {ai} from '@/ai/genkit';
import { WeeklyUpdateInput, WeeklyUpdateInputSchema, WeeklyUpdateOutput, WeeklyUpdateOutputSchema } from '../schemas/weekly-update-schemas';


const prompt = ai.definePrompt({
    name: 'weeklyUpdatePrompt',
    input: { schema: WeeklyUpdateInputSchema },
    output: { schema: WeeklyUpdateOutputSchema },
    prompt: `You are a helpful, friendly, and knowledgeable assistant for expectant parents.
    Generate a weekly development update for a pregnant user who is in week {{{week}}} of their pregnancy.
    
    Provide scientifically verified details about the baby's growth milestones, organ development, and any other expected changes for this specific week.
    The tone should be positive, reassuring, and exciting.
    The output should be structured as a list of key developments.
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
