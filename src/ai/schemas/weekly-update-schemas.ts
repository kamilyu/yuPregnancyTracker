
/**
 * @fileOverview Schemas for the weekly pregnancy update flow.
 *
 * - WeeklyUpdateInputSchema - Zod schema for the input of the weekly update flow.
 * - WeeklyUpdateInput - The inferred type from the input schema.
 * - WeeklyUpdateOutputSchema - Zod schema for the output of the weekly update flow.
 * - WeeklyUpdateOutput - The inferred type from the output schema.
 */

import { z } from 'genkit';

export const WeeklyUpdateInputSchema = z.object({
  week: z.number().min(1).max(42).describe('The current week of pregnancy.'),
});
export type WeeklyUpdateInput = z.infer<typeof WeeklyUpdateInputSchema>;

export const WeeklyUpdateOutputSchema = z.object({
    title: z.string().describe("A catchy, exciting title for the weekly update. Should include the week number."),
    description: z.string().describe("A detailed, yet easy-to-understand summary of the baby's development for the given week. Should be a paragraph of 3-5 sentences. It should be scientifically-backed, covering growth milestones, organ development, and expected changes."),
});
export type WeeklyUpdateOutput = z.infer<typeof WeeklyUpdateOutputSchema>;
