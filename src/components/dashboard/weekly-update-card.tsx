
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
import { getWeeklyUpdate } from "@/ai/flows/weekly-update-flow";


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
