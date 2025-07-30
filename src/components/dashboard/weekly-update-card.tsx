"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Baby } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Placeholder for a server action. In a real app, this would be in an actions file.
async function getWeeklyUpdate(week: number): Promise<{ title: string; description: string }> {
  console.log(`Fetching update for week ${week}`);
  // In a real app, this would call a Genkit flow.
  // const update = await someAiFlow.run({ week });
  // For now, we simulate a network request and return mock data.
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (Math.random() < 0.1) { // Simulate occasional errors
      throw new Error("Failed to fetch weekly update.");
  }

  return {
    title: `Week ${week}: Exciting Developments!`,
    description: `This week, your baby is undergoing amazing changes. Their neural pathways are forming rapidly, and they are starting to practice breathing motions. Key organs like the heart and kidneys are now fully functional. You might even feel more distinct movements as they explore their cozy home!`
  }
}


type WeeklyUpdateCardProps = {
  currentWeek: number;
};

type UpdateData = {
  title: string;
  description: string;
} | null;

export function WeeklyUpdateCard({ currentWeek }: WeeklyUpdateCardProps) {
  const [isPending, startTransition] = useTransition();
  const [updateData, setUpdateData] = useState<UpdateData>(null);
  const { toast } = useToast();

  useEffect(() => {
    startTransition(async () => {
        try {
            const data = await getWeeklyUpdate(currentWeek);
            setUpdateData(data);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Oh no! Something went wrong.",
                description: "Could not load weekly development update.",
            })
            setUpdateData(null);
        }
    });
  }, [currentWeek, toast]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Baby className="text-primary"/>
          Weekly Development
        </CardTitle>
        <CardDescription>AI-powered insights for Week {currentWeek}</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : updateData ? (
          <div>
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary/80" />
              {updateData.title}
            </h4>
            <p className="mt-2 text-muted-foreground">{updateData.description}</p>
          </div>
        ) : (
            <div className="text-center text-muted-foreground p-4">
                <p>No update available for this week. Please try again later.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
