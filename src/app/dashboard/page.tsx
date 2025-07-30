
"use client";

import { useState, useEffect } from "react";
import { differenceInWeeks, subWeeks } from "date-fns";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DueDateCard } from "@/components/dashboard/due-date-card";
import { SizeVizCard } from "@/components/dashboard/size-viz-card";
import { WeeklyUpdateCard } from "@/components/dashboard/weekly-update-card";
import { SymptomLogCard } from "@/components/dashboard/symptom-log-card";
import { TaskListCard } from "@/components/dashboard/task-list-card";
import { KickCounterCard } from "@/components/dashboard/kick-counter-card";
import { ContractionTimerCard } from "@/components/dashboard/contraction-timer-card";
import { WeightTrackerCard } from "@/components/dashboard/weight-tracker-card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import withAuth from "@/components/with-auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

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
        }
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);
  
  const handleSetDueDate = async (date: Date | null) => {
    if (user && date) {
        const userDocRef = doc(db, 'users', user.uid);
        // The `date` received is the calculated due date.
        // The pregnancy start date is 40 weeks before the due date.
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
  const currentTrimester = currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3;

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardHeader />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!dueDate ? (
            <div className="max-w-md mx-auto">
                 <DueDateCard dueDate={dueDate} setDueDate={handleSetDueDate} />
            </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
                <DueDateCard dueDate={dueDate} setDueDate={handleSetDueDate} />
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                <SizeVizCard currentWeek={currentWeek} />
                <TaskListCard currentTrimester={currentTrimester} />
            </div>
            
            <div className="lg:col-span-2 space-y-6">
                 <WeeklyUpdateCard currentWeek={currentWeek} />
                 <WeightTrackerCard />
                 <ContractionTimerCard />
                 <KickCounterCard />
                 <SymptomLogCard />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(DashboardPage);
