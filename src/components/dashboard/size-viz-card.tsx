
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { weeklySizeComparisons } from "@/data/pregnancy-data";
import { Separator } from "../ui/separator";

type SizeVizCardProps = {
  currentWeek: number;
};

export function SizeVizCard({ currentWeek }: SizeVizCardProps) {
  const comparison =
    weeklySizeComparisons.find((c) => c.week === currentWeek) ||
    weeklySizeComparisons[weeklySizeComparisons.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Baby's Size This Week</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <Image
          src={`https://placehold.co/200x200.png`}
          alt={comparison.item}
          data-ai-hint={comparison.hint}
          width={150}
          height={150}
          className="rounded-full bg-accent/50 object-contain w-36 h-36 p-4 transition-transform hover:scale-105 duration-300"
        />
        <p className="mt-4 text-lg">
          Your baby is about the size of a
        </p>
        <p className="text-2xl font-bold text-primary">{comparison.item}</p>
        
        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-4 w-full text-center">
            <div>
                <p className="text-xl font-bold text-primary">{comparison.height}</p>
                <p className="text-sm text-muted-foreground">Est. Height</p>
            </div>
            <div>
                <p className="text-xl font-bold text-primary">{comparison.weight}</p>
                <p className="text-sm text-muted-foreground">Est. Weight</p>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
