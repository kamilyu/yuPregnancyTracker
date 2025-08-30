
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp, writeBatch } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { isToday } from "date-fns";
import { Skeleton } from "../ui/skeleton";
import { dailyWellnessMissions } from "@/data/mission-data";

type Mission = {
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
};

type DailyMissionDoc = {
    missions: Mission[];
    isCompleted: boolean;
    generatedAt: Timestamp;
};

// Function to shuffle an array and pick the first n items
function getRandomMissions(arr: typeof dailyWellnessMissions, n: number): Mission[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n).map(m => ({ ...m, isCompleted: false }));
}


export function DailyMissionsCard({ pregnancyWeek }: { pregnancyWeek: number }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);

    const todayId = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    useEffect(() => {
        if (!user) return;

        const fetchMissions = async () => {
            setLoading(true);
            const missionDocRef = doc(db, 'users', user.uid, 'dailyMissions', todayId);
            const userDocRef = doc(db, 'users', user.uid);
            
            try {
                const [missionDocSnap, userDocSnap] = await Promise.all([getDoc(missionDocRef), getDoc(userDocRef)]);
                const userData = userDocSnap.data();

                if (userData) {
                   setStreak(userData.missionStreak || 0);
                }

                if (missionDocSnap.exists()) {
                    const missionData = missionDocSnap.data() as DailyMissionDoc;
                    setMissions(missionData.missions);
                } else {
                    const newMissions = getRandomMissions(dailyWellnessMissions, 4);
                    await setDoc(missionDocRef, { 
                        missions: newMissions,
                        isCompleted: false,
                        generatedAt: Timestamp.now()
                    });
                    setMissions(newMissions);
                }
            } catch (error) {
                console.error("Error fetching or generating missions:", error);
                toast({ variant: 'destructive', title: "Failed to load missions" });
            } finally {
                setLoading(false);
            }
        };

        fetchMissions();
    }, [user, todayId, toast]);

    const handleMissionCheck = async (missionId: string) => {
        const updatedMissions = missions.map(m =>
            m.id === missionId ? { ...m, isCompleted: !m.isCompleted } : m
        );
        setMissions(updatedMissions);

        const allCompleted = updatedMissions.every(m => m.isCompleted);

        if (user) {
            const missionDocRef = doc(db, 'users', user.uid, 'dailyMissions', todayId);
            await setDoc(missionDocRef, { missions: updatedMissions, isCompleted: allCompleted }, { merge: true });

            if (allCompleted) {
                 const userDocRef = doc(db, 'users', user.uid);
                 const userDocSnap = await getDoc(userDocRef);
                 const userData = userDocSnap.data();
                 const lastCompletionDate = userData?.lastMissionCompletionDate?.toDate();

                 let newStreak = userData?.missionStreak || 0;
                 if (!lastCompletionDate || !isToday(lastCompletionDate)) {
                    newStreak = newStreak + 1;
                 
                    const batch = writeBatch(db);
                    batch.update(userDocRef, {
                        missionStreak: newStreak,
                        longestMissionStreak: Math.max(userData?.longestMissionStreak || 0, newStreak),
                        lastMissionCompletionDate: Timestamp.now(),
                    });
                    await batch.commit();
                    setStreak(newStreak);
                    toast({ title: "🎉 All missions completed for today! Great job!" });
                 }
            }
        }
    };

    const progress = missions.length > 0 ? (missions.filter(m => m.isCompleted).length / missions.length) * 100 : 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Target className="text-accent-foreground"/>
                            Daily Wellness Missions
                        </CardTitle>
                        <CardDescription>Complete these 4 missions to build healthy habits.</CardDescription>
                    </div>
                     <div className="text-center">
                        <div className="flex items-center justify-center text-accent-foreground gap-1">
                            <Flame className="w-6 h-6"/>
                            <span className="text-3xl font-bold">{streak}</span>
                        </div>
                        <p className="text-xs text-muted-foreground -mt-1">Day Streak</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Progress value={progress} className="h-3 [&>div]:bg-accent" />
                 <div className="space-y-3">
                    {loading ? (
                        <>
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </>
                    ) : missions.map(mission => (
                        <div
                            key={mission.id}
                            className={cn(
                                "flex items-start gap-4 p-3 rounded-lg transition-colors",
                                mission.isCompleted ? "bg-muted text-muted-foreground line-through" : "bg-muted/50"
                            )}
                        >
                            <Checkbox
                                checked={mission.isCompleted}
                                onCheckedChange={() => handleMissionCheck(mission.id)}
                                className="h-6 w-6 mt-1 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                id={`mission-${mission.id}`}
                            />
                            <div className="flex-grow">
                                <label htmlFor={`mission-${mission.id}`} className="font-semibold cursor-pointer">{mission.title}</label>
                                <p className="text-xs">{mission.description}</p>
                            </div>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
    );
}
