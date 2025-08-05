
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Baby, Lightbulb, Heart, Sparkles, Milestone } from "lucide-react";
import { dailyDevelopmentData, milestones } from "@/data/daily-development-data";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type DailyUpdateCardProps = {
  currentWeek: number;
  dayOfPregnancy: number;
};

export function DailyUpdateCard({ currentWeek, dayOfPregnancy }: DailyUpdateCardProps) {
  const [dailyData, setDailyData] = useState(dailyDevelopmentData[0]);
  const [milestone, setMilestone] = useState<string | null>(null);

  useEffect(() => {
    // dayOfPregnancy is 1-based for a 280 day cycle
    const todayIndex = dayOfPregnancy > 0 ? dayOfPregnancy - 1 : 0;
    const data = dailyDevelopmentData[todayIndex % dailyDevelopmentData.length];
    setDailyData(data);

    // Check for milestone
    if (milestones[currentWeek]) {
        setMilestone(milestones[currentWeek]);
    } else {
        setMilestone(null);
    }
  }, [currentWeek, dayOfPregnancy]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Baby className="text-primary"/>
          Your Baby Today
        </CardTitle>
        <CardDescription>A daily look at your baby's development in week {currentWeek}.</CardDescription>
      </CardHeader>
      <CardContent>
        {milestone && (
            <Alert className="mb-4 bg-accent/20 border-accent/50">
                <Milestone className="h-4 w-4 text-primary" />
                <AlertTitle className="font-headline">{milestone}</AlertTitle>
                <AlertDescription>
                    Congratulations on reaching this important stage of your pregnancy!
                </AlertDescription>
            </Alert>
        )}
        <div className="space-y-3">
            <h4 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary/80" />
                Baby is the size of a {dailyData.babySize}
            </h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-3">
                    <Heart className="w-4 h-4 mt-0.5 shrink-0 text-primary/80" />
                    <span><strong>Development:</strong> {dailyData.developmentFact}</span>
                </li>
                 <li className="flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-primary/80" />
                    <span><strong>Pregnancy Tip:</strong> {dailyData.pregnancyTip}</span>
                </li>
            </ul>
        </div>
      </CardContent>
    </Card>
  );
}
