
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
import { Ruler, Weight } from "lucide-react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";

type SizeVizCardProps = {
  currentWeek: number;
  unitPreference: 'imperial' | 'metric';
  setUnitPreference: (unit: 'imperial' | 'metric') => void;
};

export function SizeVizCard({ currentWeek, unitPreference, setUnitPreference }: SizeVizCardProps) {
  const { user } = useAuth();
  const comparison =
    weeklySizeComparisons.find((c) => c.week === currentWeek) ||
    weeklySizeComparisons[weeklySizeComparisons.length - 1];

  const handleUnitChange = async (checked: boolean) => {
    const newUnit = checked ? 'metric' : 'imperial';
    setUnitPreference(newUnit);
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { unitPreference: newUnit }, { merge: true });
    }
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="font-headline">Baby's Size This Week</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="unit-switch" className="text-sm text-muted-foreground">lbs/in</Label>
          <Switch
            id="unit-switch"
            checked={unitPreference === 'metric'}
            onCheckedChange={handleUnitChange}
          />
          <Label htmlFor="unit-switch" className="text-sm text-muted-foreground">kg/cm</Label>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <Image
          src={`https://placehold.co/400x400.png`}
          alt={comparison.item}
          data-ai-hint={comparison.hint}
          width={200}
          height={200}
          className="rounded-full bg-accent/50 object-contain w-48 h-48 p-4 transition-transform hover:scale-105 duration-300"
        />
        <p className="mt-4 text-lg">
          Your baby is about the size of a
        </p>
        <p className="text-2xl font-bold text-primary">{comparison.item}</p>
        
        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-4 w-full text-center">
            <div>
                <Ruler className="mx-auto mb-1 h-5 w-5 text-primary/80" />
                <p className="text-xl font-bold text-primary">{unitPreference === 'metric' ? comparison.height_cm : comparison.height}</p>
                <p className="text-sm text-muted-foreground">Est. Height</p>
            </div>
            <div>
                 <Weight className="mx-auto mb-1 h-5 w-5 text-primary/80" />
                <p className="text-xl font-bold text-primary">{unitPreference === 'metric' ? comparison.weight_g : comparison.weight}</p>
                <p className="text-sm text-muted-foreground">Est. Weight</p>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
