
"use client";

import { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp, writeBatch } from "firebase/firestore";
import { generateDailyMissions } from "@/ai/flows/mission-flow";
import type { Mission } from "@/ai/schemas/mission-schemas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { isToday } from "date-fns";
import { Skeleton } from "../ui/skeleton";

type DailyMissionDoc = {
    missions: Mission[];
    isCompleted: boolean;
    generatedAt: Timestamp;
};

export function DailyMissionsCard({ pregnancyWeek }: { pregnancyWeek: number }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
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
                    startTransition(async () => {
                        const previousMissionIds: string[] = []; // TODO: Fetch recent missions to avoid repeats
                        const result = await generateDailyMissions({ pregnancyWeek, previousMissionIds });
                        if (result && result.missions) {
                            const newMissions = result.missions.map(m => ({...m, id: m.category + "_" + Date.now() + Math.random()}));
                            await setDoc(missionDocRef, { 
                                missions: newMissions,
                                isCompleted: false,
                                generatedAt: Timestamp.now()
                            });
                            setMissions(newMissions);
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching or generating missions:", error);
                toast({ variant: 'destructive', title: "Failed to load missions" });
            } finally {
                setLoading(false);
            }
        };

        fetchMissions();
    }, [user, todayId, pregnancyWeek, toast]);

    const handleMissionCheck = async (missionId: string) => {
        const updatedMissions = missions.map(m =>
            m.id === missionId ? { ...m, isCompleted: !m.isCompleted } : m
        );
        setMissions(updatedMissions);

        const completedCount = updatedMissions.filter(m => m.isCompleted).length;
        const allCompleted = completedCount === missions.length;

        if (user) {
            const missionDocRef = doc(db, 'users', user.uid, 'dailyMissions', todayId);
            await setDoc(missionDocRef, { missions: updatedMissions, isCompleted: allCompleted }, { merge: true });

            if (allCompleted) {
                 const userDocRef = doc(db, 'users', user.uid);
                 const userDocSnap = await getDoc(userDocRef);
                 const userData = userDocSnap.data();
                 const lastCompletionDate = userData?.lastMissionCompletionDate?.toDate();

                 let newStreak = userData?.missionStreak || 0;
                 // Only increment streak if the last completion wasn't today
                 if (!lastCompletionDate || !isToday(lastCompletionDate)) {
                    newStreak = newStreak + 1;
                 
                    const batch = writeBatch(db);
                    batch.update(userDocRef, {
                        missionStreak: newStreak,
                        lastMissionCompletionDate: Timestamp.now(),
                        longestMissionStreak: Math.max(userData?.longestMissionStreak || 0, newStreak)
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
                            <Target className="text-primary"/>
                            Daily Wellness Missions
                        </CardTitle>
                        <CardDescription>Complete these 4 missions to build healthy habits.</CardDescription>
                    </div>
                     <div className="text-center">
                        <div className="flex items-center justify-center text-primary gap-1">
                            <Flame className="w-6 h-6"/>
                            <span className="text-3xl font-bold">{streak}</span>
                        </div>
                        <p className="text-xs text-muted-foreground -mt-1">Day Streak</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Progress value={progress} className="h-3" />
                 <div className="space-y-3">
                    {(loading || isPending) ? (
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
                                "flex items-center gap-4 p-3 rounded-lg transition-colors",
                                mission.isCompleted ? "bg-secondary/60 text-muted-foreground line-through" : "bg-secondary/30"
                            )}
                        >
                            <span className="text-2xl">{mission.icon}</span>
                            <div className="flex-grow">
                                <p className="font-semibold">{mission.title}</p>
                                <p className="text-xs">{mission.description}</p>
                            </div>
                            <Checkbox
                                checked={mission.isCompleted}
                                onCheckedChange={() => handleMissionCheck(mission.id)}
                                className="h-6 w-6"
                            />
                        </div>
                    ))}
                 </div>
                 {isPending && !loading && (
                    <div className="flex items-center justify-center text-muted-foreground text-sm">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating your personalized missions for today...
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
