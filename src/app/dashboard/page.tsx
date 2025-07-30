"use client";

import { useState, useEffect } from "react";
import { differenceInWeeks } from "date-fns";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DueDateCard } from "@/components/dashboard/due-date-card";
import { SizeVizCard } from "@/components/dashboard/size-viz-card";
import { WeeklyUpdateCard } from "@/components/dashboard/weekly-update-card";
import { SymptomLogCard } from "@/components/dashboard/symptom-log-card";
import { TaskListCard } from "@/components/dashboard/task-list-card";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  // In a real app, this would be fetched from Firestore for the logged-in user.
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate fetching user data
  useEffect(() => {
    const fetchUserData = async () => {
        // Simulate API call to get user's due date
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Example: set a pre-existing due date
        // const userDueDate = new Date();
        // userDueDate.setDate(userDueDate.getDate() + 180);
        // setDueDate(userDueDate);
        setLoading(false);
    };
    fetchUserData();
  }, []);

  if (loading) {
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
                 <DueDateCard dueDate={dueDate} setDueDate={setDueDate} />
            </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
                <DueDateCard dueDate={dueDate} setDueDate={setDueDate} />
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                <SizeVizCard currentWeek={currentWeek} />
            </div>
            
            <div className="lg:col-span-2 space-y-6">
                 <WeeklyUpdateCard currentWeek={currentWeek} />
            </div>

            <div className="lg:col-span-2 space-y-6">
                <SymptomLogCard />
            </div>

            <div className="lg:col-span-1 space-y-6">
                <TaskListCard currentTrimester={currentTrimester} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
