
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
    title: z.string().describe("A catchy, exciting title for the weekly update. Should include the week number. e.g. \"Week 8: Tiny Fingers and Toes!\""),
    sizeComparison: z.string().describe("A comparison of the baby's size to a fruit or vegetable, including the approximate length. e.g. \"a raspberry (about 0.6 inches)\""),
    physicalDevelopment: z.string().describe("A bullet point describing the baby's external physical developments for the week."),
    organDevelopment: z.string().describe("A bullet point describing the baby's internal organ and system developments for the week."),
    notableChanges: z.string().describe("A friendly and encouraging closing statement about the week's progress."),
});
export type WeeklyUpdateOutput = z.infer<typeof WeeklyUpdateOutputSchema>;
