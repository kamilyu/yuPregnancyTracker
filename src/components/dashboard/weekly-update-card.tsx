
"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Baby, Ruler, Heart, ToyBrick } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getWeeklyUpdate } from "@/ai/flows/weekly-update-flow";
import type { WeeklyUpdateOutput } from "@/ai/schemas/weekly-update-schemas";


type WeeklyUpdateCardProps = {
  currentWeek: number;
};

type UpdateData = WeeklyUpdateOutput | null;

export function WeeklyUpdateCard({ currentWeek }: WeeklyUpdateCardProps) {
  const [isPending, startTransition] = useTransition();
  const [updateData, setUpdateData] = useState<UpdateData>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentWeek) return;
    startTransition(async () => {
        try {
            const data = await getWeeklyUpdate({week: currentWeek});
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
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : updateData ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary/80" />
              {updateData.title}
            </h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-3">
                    <Ruler className="w-4 h-4 mt-0.5 shrink-0 text-primary/80" />
                    <span>Your baby is now the size of a {updateData.sizeComparison}.</span>
                </li>
                 <li className="flex items-start gap-3">
                    <ToyBrick className="w-4 h-4 mt-0.5 shrink-0 text-primary/80" />
                    <span>{updateData.physicalDevelopment}</span>
                </li>
                 <li className="flex items-start gap-3">
                    <Heart className="w-4 h-4 mt-0.5 shrink-0 text-primary/80" />
                    <span>{updateData.organDevelopment}</span>
                </li>
                 <li className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-primary/80" />
                    <span>{updateData.notableChanges}</span>
                </li>
            </ul>
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
