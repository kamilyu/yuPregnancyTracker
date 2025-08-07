
/**
 * @fileOverview Schemas for the daily wellness mission generation flow.
 */

import { z } from 'genkit';

export const MissionSchema = z.object({
    id: z.string().describe("A unique identifier for the mission, e.g., 'hydration_1'"),
    category: z.enum(['hydration', 'exercise', 'education', 'self-care', 'nutrition', 'mental-health']).describe("The category of the mission."),
    title: z.string().describe("The user-facing title of the mission."),
    description: z.string().describe("A brief, encouraging description of the mission."),
    icon: z.string().describe("An emoji representing the mission."),
    isCompleted: z.boolean().default(false).describe("Whether the mission has been completed by the user."),
    difficulty: z.enum(['easy', 'medium', 'hard']).describe("The difficulty level of the mission."),
});
export type Mission = z.infer<typeof MissionSchema>;

export const MissionGenerationInputSchema = z.object({
  pregnancyWeek: z.number().min(1).max(42).describe('The current week of pregnancy.'),
  previousMissionIds: z.array(z.string()).describe('A list of mission IDs that the user has completed recently to avoid repetition.'),
});
export type MissionGenerationInput = z.infer<typeof MissionGenerationInputSchema>;

export const MissionGenerationOutputSchema = z.object({
    missions: z.array(MissionSchema).length(4).describe("An array of exactly 4 personalized daily wellness missions.")
});
export type MissionGenerationOutput = z.infer<typeof MissionGenerationOutputSchema>;
