
"use client";

import { useState, useEffect } from "react";
import { differenceInWeeks, subWeeks, format, differenceInDays } from "date-fns";
import { SizeVizCard } from "@/components/dashboard/size-viz-card";
import { TaskListCard } from "@/components/dashboard/task-list-card";
import { Loader2, Calendar, Hourglass, Layers } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import withAuth from "@/components/with-auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DueDateCard } from "@/components/dashboard/due-date-card";
import { Card, CardContent } from "@/components/ui/card";
import { DailyJournalCard } from "@/components/dashboard/daily-journal-card";
import { WeeklyUpdateCard } from "@/components/dashboard/weekly-update-card";
import { Separator } from "@/components/ui/separator";
import { DailyMissionsCard } from "@/components/dashboard/daily-missions-card";
import { QuestionOfTheDayCard } from "@/components/dashboard/question-of-the-day-card";

type UnitPreference = 'imperial' | 'metric';

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [unitPreference, setUnitPreference] = useState<UnitPreference>('imperial');


  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.dueDate && data.dueDate.toDate) {
            setDueDate(data.dueDate.toDate());
          }
          if (data.unitPreference) {
            setUnitPreference(data.unitPreference);
          }
        }
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);
  
  const handleSetDueDate = async (date: Date | null) => {
    if (user && date) {
        const userDocRef = doc(db, 'users', user.uid);
        const pregnancyStartDate = subWeeks(date, 40);
        await setDoc(userDocRef, { 
            dueDate: Timestamp.fromDate(date),
            pregnancyStartDate: Timestamp.fromDate(pregnancyStartDate)
        }, { merge: true });
        setDueDate(date);
    }
  }


  if (authLoading || loading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  const today = new Date();
  const currentWeek = dueDate ? 40 - differenceInWeeks(dueDate, today) : 1;
  const daysRemaining = dueDate ? differenceInDays(dueDate, today) : 280;
  const currentTrimester = currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3;
  const pregnancyStartDate = dueDate ? subWeeks(dueDate, 40) : new Date();
  const dayOfPregnancy = differenceInDays(today, pregnancyStartDate);


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
       {!dueDate ? (
            <div className="max-w-md mx-auto">
                 <DueDateCard dueDate={dueDate} setDueDate={handleSetDueDate} />
            </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SizeVizCard currentWeek={currentWeek} unitPreference={unitPreference} setUnitPreference={setUnitPreference} />
                 <Card>
                    <CardContent className="flex justify-around items-center text-center pt-6 h-full">
                        <div className="flex flex-col items-center justify-center">
                             <Calendar className="w-6 h-6 mb-2 text-primary/80" />
                            <p className="text-3xl font-bold text-primary">{currentWeek}</p>
                            <p className="text-sm text-muted-foreground">Week</p>
                        </div>
                         <Separator orientation="vertical" className="h-16" />
                        <div className="flex flex-col items-center justify-center">
                            <Hourglass className="w-6 h-6 mb-2 text-primary/80" />
                            <p className="text-3xl font-bold text-primary">{daysRemaining > 0 ? daysRemaining : 0}</p>
                            <p className="text-sm text-muted-foreground">Days Left</p>
                        </div>
                         <Separator orientation="vertical" className="h-16" />
                        <div className="flex flex-col items-center justify-center">
                            <Layers className="w-6 h-6 mb-2 text-primary/80" />
                            <p className="text-3xl font-bold text-primary">{currentTrimester}</p>
                            <p className="text-sm text-muted-foreground">Trimester</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <WeeklyUpdateCard currentWeek={currentWeek} />
            <DailyMissionsCard pregnancyWeek={currentWeek} />
            <DailyJournalCard />
            <QuestionOfTheDayCard />

            <div className="grid grid-cols-1 gap-6">
                <TaskListCard currentTrimester={currentTrimester} />
            </div>
         </>
        )}
    </div>
  );
}

export default withAuth(DashboardPage);
