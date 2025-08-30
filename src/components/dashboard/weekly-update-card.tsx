
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Baby, Ruler, Heart, ToyBrick } from "lucide-react";
import { weeklyDevelopmentUpdates } from "@/data/pregnancy-data";

type WeeklyUpdateCardProps = {
  currentWeek: number;
};

export function WeeklyUpdateCard({ currentWeek }: WeeklyUpdateCardProps) {
  const updateData = weeklyDevelopmentUpdates.find(u => u.week === currentWeek) || weeklyDevelopmentUpdates[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Baby className="text-primary"/>
          Weekly Development
        </CardTitle>
        <CardDescription>Key insights for Week {currentWeek}</CardDescription>
      </CardHeader>
      <CardContent>
        {updateData ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary/80" />
              {updateData.title}
            </h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-3">
                    <Ruler className="w-4 h-4 mt-0.5 shrink-0 text-primary/80" />
                    <span>Your baby is now the size of {updateData.sizeComparison}.</span>
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
                <p>No update available for this week. Please check back later.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

    