
'use server';
/**
 * @fileOverview A flow for generating daily wellness missions for pregnant users.
 *
 * - generateDailyMissions - A function that generates 4 daily missions.
 * - MissionGenerationInput - The input type for the generateDailyMissions function.
 * - MissionGenerationOutput - The return type for the generateDailyMissions function.
 */

import {ai} from '@/ai/genkit';
import { MissionGenerationInput, MissionGenerationInputSchema, MissionGenerationOutput, MissionGenerationOutputSchema } from '../schemas/mission-schemas';

const missionGenerationPrompt = ai.definePrompt({
    name: 'missionGenerationPrompt',
    input: { schema: MissionGenerationInputSchema },
    output: { schema: MissionGenerationOutputSchema },
    prompt: `You are a compassionate and knowledgeable pregnancy wellness coach. Your task is to generate 4 unique and personalized daily wellness missions for an expectant mother who is in week {{{pregnancyWeek}}} of her pregnancy.

    **Instructions:**
    1.  **Generate Exactly 4 Missions:** Create a diverse set of 4 missions, one from each of the following categories:
        *   **Nutrition or Hydration:** Focus on healthy eating or drinking habits.
        *   **Physical Activity:** Suggest gentle, pregnancy-safe exercises.
        *   **Education or Preparation:** Encourage learning about pregnancy, birth, or baby care.
        *   **Mental & Emotional Well-being (Self-Care or Mental Health):** Promote relaxation, mindfulness, and emotional health.

    2.  **Personalize for Pregnancy Week ({{{pregnancyWeek}}}):**
        *   **First Trimester (Weeks 1-13):** Focus on foundational habits, managing early symptoms (like nausea, fatigue), and gentle self-care.
        *   **Second Trimester (Weeks 14-27):** Introduce more active goals, preparation tasks (like researching classes), and connecting with the baby.
        *   **Third Trimester (Weeks 28-40+):** Focus on birth preparation, comfort measures, rest, and nesting activities.

    3.  **Avoid Repetition:** Do not include any of the following mission ideas, as the user has seen them recently: {{{previousMissionIds}}}. Be creative and provide fresh suggestions.

    4.  **Keep it Simple & Actionable:** Missions should be clear, achievable within a day, and use encouraging language.

    **Example Mission (Week 15):**
    - **Category:** nutrition
    - **Title:** "Eat a Leafy Green Salad"
    - **Description:** "Nourish yourself and your baby with folate-rich greens like spinach or kale."
    - **Icon:** "🥗"
    - **Difficulty:** "easy"

    Generate the 4 missions now.
    `,
});


export async function generateDailyMissions(input: MissionGenerationInput): Promise<MissionGenerationOutput> {
    const { output } = await missionGenerationPrompt(input);
    return output!;
}
