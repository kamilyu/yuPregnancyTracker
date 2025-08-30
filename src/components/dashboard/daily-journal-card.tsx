
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc, query, orderBy, limit, writeBatch, Timestamp, getDoc } from 'firebase/firestore';
import { isToday, isYesterday, startOfDay, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Flame, PenSquare, Sparkles, Trophy } from 'lucide-react';
import { moods, symptoms } from '@/data/journal-data';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

type JournalEntry = {
    id: string; // YYYY-MM-DD
    date: Timestamp;
    mood: string | null;
    symptoms: string[];
    journalText: string;
};

export function DailyJournalCard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);

    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [todaysEntry, setTodaysEntry] = useState<Partial<JournalEntry> | null>(null);

    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [journalText, setJournalText] = useState("");

    const todayId = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
    function format(date: Date, format: string): string {
        // basic formatter, not fully featured
        if (format === 'yyyy-MM-dd') {
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
        }
        return ''
    }


    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const journalDocRef = doc(db, 'users', user.uid, 'dailyJournal', todayId);
        
        const unsubscribeEntry = onSnapshot(journalDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as JournalEntry;
                setTodaysEntry(data);
                setSelectedMood(data.mood);
                setSelectedSymptoms(data.symptoms);
                setJournalText(data.journalText);
            } else {
                setTodaysEntry(null);
                 setSelectedMood(null);
                setSelectedSymptoms([]);
                setJournalText("");
            }
        }, (err) => {
            console.error("Error fetching today's journal entry:", err);
            toast({ variant: 'destructive', title: "Could not load today's journal." });
        });

        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            const data = doc.data();
            setCurrentStreak(data?.journalStreak || 0);
            setLongestStreak(data?.longestJournalStreak || 0);
        });

        setLoading(false);
        
        return () => {
            unsubscribeEntry();
            unsubscribeUser();
        }

    }, [user, todayId, toast]);

    const handleSymptomChange = (symptom: string) => {
        setSelectedSymptoms(prev => {
            if (symptom === 'No Symptoms') {
                return prev.includes('No Symptoms') ? [] : ['No Symptoms'];
            }
            const newSymptoms = prev.filter(s => s !== 'No Symptoms');
            if (newSymptoms.includes(symptom)) {
                return newSymptoms.filter(s => s !== symptom);
            } else {
                return [...newSymptoms, symptom];
            }
        });
    }

    const handleSave = async () => {
        if (!user) return;
        if (!selectedMood && selectedSymptoms.length === 0 && journalText.trim() === '') {
            toast({ variant: 'destructive', title: "Nothing to save", description: "Please select a mood, symptom, or write a note."});
            return;
        }

        try {
            const batch = writeBatch(db);
            const userDocRef = doc(db, 'users', user.uid);
            const journalDocRef = doc(db, 'users', user.uid, 'dailyJournal', todayId);
            const userDocSnap = await getDoc(userDocRef);
            
            let currentStreak = userDocSnap.data()?.journalStreak || 0;
            let longestStreak = userDocSnap.data()?.longestJournalStreak || 0;
            const lastEntryDate = userDocSnap.data()?.lastJournalEntry?.toDate();
            
            // This check ensures we only update the streak once per day, on the first save.
            if (!todaysEntry) { 
                if (lastEntryDate && isYesterday(lastEntryDate)) {
                    currentStreak++; // Continue streak
                } else if (!lastEntryDate || !isToday(lastEntryDate)) {
                    currentStreak = 1; // Start new streak if it's not today or yesterday
                }
            }

            if(currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }

            const entryData: Omit<JournalEntry, 'id'> = {
                date: Timestamp.now(),
                mood: selectedMood,
                symptoms: selectedSymptoms,
                journalText: journalText,
            };

            batch.set(journalDocRef, entryData, { merge: true });
            batch.update(userDocRef, { 
                journalStreak: currentStreak, 
                longestJournalStreak: longestStreak,
                lastJournalEntry: Timestamp.now() 
            });

            await batch.commit();

            toast({
                title: "Journal Saved!",
                description: "Your entry for today has been logged.",
            });
        } catch (error) {
            console.error("Error saving journal entry:", error);
            toast({ variant: 'destructive', title: "Save failed", description: "Could not save your journal entry."});
        }
    };
    
    if (loading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                <CardContent><Skeleton className="h-24 w-full" /></CardContent>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden">
            <div className="bg-secondary/10 p-4 sm:p-6 flex justify-between items-center">
                <div>
                    <h3 className="font-headline text-xl text-black">Daily Check-in</h3>
                    <p className="text-muted-foreground text-sm">How are you feeling today?</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center text-secondary/80 gap-1">
                            <Flame className="w-6 h-6"/>
                            <span className="text-3xl font-bold">{currentStreak}</span>
                        </div>
                        <p className="text-xs text-muted-foreground -mt-1">Day Streak</p>
                    </div>
                     <div className="text-center">
                        <div className="flex items-center justify-center text-secondary/70 gap-1">
                            <Trophy className="w-6 h-6"/>
                            <span className="text-3xl font-bold">{longestStreak}</span>
                        </div>
                        <p className="text-xs text-muted-foreground -mt-1">Longest</p>
                    </div>
                </div>
            </div>
            <CardContent className="p-4 sm:p-6 grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">How's your mood?</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {moods.map(mood => (
                                <button
                                    key={mood.label}
                                    onClick={() => setSelectedMood(mood.label)}
                                    className={cn(
                                        "p-2 flex flex-col items-center gap-1.5 rounded-lg border-2 transition-colors",
                                        selectedMood === mood.label ? "border-secondary bg-secondary/10" : "border-transparent bg-muted/50 hover:bg-muted"
                                    )}
                                >
                                    <span className="text-2xl">{mood.icon}</span>
                                    <span className="text-xs text-muted-foreground">{mood.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                         <h4 className="font-semibold text-sm">Any symptoms?</h4>
                         <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {symptoms.map(symptom => (
                                <div key={symptom} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`symptom-${symptom}`}
                                        checked={selectedSymptoms.includes(symptom)}
                                        onCheckedChange={() => handleSymptomChange(symptom)}
                                        className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                                    />
                                    <label
                                        htmlFor={`symptom-${symptom}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {symptom}
                                    </label>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
                 <div className="space-y-4 flex flex-col">
                    <div className="space-y-2 flex-grow flex flex-col">
                        <h4 className="font-semibold text-sm">Today's Journal</h4>
                        <Textarea 
                            placeholder="Write about your day, your feelings, or any special moments..."
                            value={journalText}
                            onChange={(e) => setJournalText(e.target.value)}
                            className="flex-grow"
                        />
                    </div>
                    <Button onClick={handleSave} variant="secondary">
                       <Sparkles className="mr-2" /> {todaysEntry ? 'Update Today\'s Entry' : 'Save Today\'s Entry'}
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}
