
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Square, Timer, Trash2, HeartPulse, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Contraction = {
  startTime: number; // Unix timestamp
  endTime: number | null; // Unix timestamp
  duration: number | null; // seconds
  interval: number | null; // seconds from start of previous
  intensity: number;
};

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const LOCAL_STORAGE_KEY = 'storkwatch_contraction_session';

export function ContractionTimerCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isTiming, setIsTiming] = useState(false);
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [intensity, setIntensity] = useState(5);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load session from local storage on mount
  useEffect(() => {
    if (!user) return;
    try {
      const savedSession = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${user.uid}`);
      if (savedSession) {
        setContractions(JSON.parse(savedSession));
      }
    } catch (error) {
      console.error("Failed to load session from local storage", error);
    }
  }, [user]);

  // Save session to local storage on change
  useEffect(() => {
    if (!user) return;
    try {
        if (contractions.length > 0) {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_${user.uid}`, JSON.stringify(contractions));
        } else {
            localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${user.uid}`);
        }
    } catch (error) {
      console.error("Failed to save session to local storage", error);
    }
  }, [contractions, user]);


  const startTimer = useCallback(() => {
    const now = Date.now();
    const lastContraction = contractions[contractions.length - 1];
    const newContraction: Contraction = {
      startTime: now,
      endTime: null,
      duration: null,
      interval: lastContraction ? (now - lastContraction.startTime) / 1000 : null,
      intensity: intensity,
    };
    
    setContractions(prev => [...prev, newContraction]);
    setIsTiming(true);
    setCurrentDuration(0);

    timerRef.current = setInterval(() => {
      setCurrentDuration(prev => prev + 1);
    }, 1000);
  }, [intensity, contractions]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsTiming(false);
    
    setContractions(prev => {
      const last = prev[prev.length - 1];
      if (last) {
        last.endTime = Date.now();
        last.duration = currentDuration;
        return [...prev.slice(0, -1), last];
      }
      return prev;
    });
  }, [currentDuration]);

  const handleStartStop = () => {
    if (isTiming) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const handleClearSession = () => {
    setContractions([]);
    if (isTiming) stopTimer();
    toast({
        title: "Session Cleared",
        description: "Your current contraction history has been cleared.",
    });
  };

  const handleSaveSession = async () => {
    if (!user || contractions.length === 0) {
        toast({
            variant: "destructive",
            title: "No data to save",
            description: "Please record some contractions first."
        });
        return;
    }

    try {
        const batch = writeBatch(db);
        const sessionDate = new Date();
        const userContractionsCol = collection(db, 'users', user.uid, 'contractionTracking');

        contractions.forEach(c => {
            const newDocRef = doc(userContractionsCol);
            batch.set(newDocRef, {
                userId: user.uid,
                sessionDate: sessionDate, // Use the same date for the whole session
                contractionStart: new Date(c.startTime),
                contractionEnd: c.endTime ? new Date(c.endTime) : null,
                duration: c.duration,
                intervalBetween: c.interval,
                intensity: c.intensity,
                createdAt: serverTimestamp()
            });
        });

        await batch.commit();

        toast({
            title: "Session Saved!",
            description: `Successfully saved ${contractions.length} contractions to the cloud.`
        });
        // Clear local session after successful save
        handleClearSession();

    } catch (error) {
        console.error("Error saving session: ", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save your session to the cloud. Your data is still safe on this device."
        })
    }
  };

  const calculateStats = () => {
    if (contractions.length < 2) return { avgDuration: 0, avgFrequency: 0, isRegular: false };
    const validContractions = contractions.filter(c => c.duration !== null);
    const totalDuration = validContractions.reduce((acc, c) => acc + c.duration!, 0);
    const avgDuration = totalDuration / validContractions.length;

    const validIntervals = contractions.slice(1).map(c => c.interval).filter(i => i !== null);
    const totalIntervalTime = validIntervals.reduce((acc, i) => acc + i!, 0);
    const avgFrequency = totalIntervalTime / validIntervals.length;

    // A simple check for regularity
    const stdDev = Math.sqrt(validIntervals.map(x => Math.pow(x! - avgFrequency, 2)).reduce((a, b) => a + b) / validIntervals.length);
    const isRegular = stdDev < 60; // if standard deviation is less than a minute

    return { avgDuration, avgFrequency, isRegular };
  }

  const { avgDuration, avgFrequency, isRegular } = calculateStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <HeartPulse className="text-primary" />
            Contraction Timer
        </CardTitle>
        <CardDescription>Time contractions and track their frequency.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center gap-4 p-4 bg-secondary/30 rounded-lg">
            <div className='text-6xl font-mono font-bold text-primary tabular-nums'>
                {formatDuration(isTiming ? currentDuration : contractions[contractions.length-1]?.duration ?? 0)}
            </div>
            <p className='text-muted-foreground'>
                {isTiming ? "Contraction in Progress..." : "Last Contraction Duration"}
            </p>
            <Button onClick={handleStartStop} size="lg" className="w-48" variant={isTiming ? 'destructive' : 'default'}>
                {isTiming ? <Square className="mr-2"/> : <Play className="mr-2"/>}
                {isTiming ? 'Stop' : 'Start'}
            </Button>
        </div>
        
        {!isTiming && (
             <div className='space-y-3 px-2'>
                <label htmlFor="intensity" className='text-sm font-medium'>Intensity (1-10)</label>
                <div className="flex items-center gap-4">
                    <Slider 
                        id="intensity"
                        min={1} 
                        max={10} 
                        step={1}
                        value={[intensity]}
                        onValueChange={(value) => setIntensity(value[0])}
                        disabled={isTiming}
                    />
                    <span className='font-semibold text-primary w-6 text-center'>{intensity}</span>
                </div>
            </div>
        )}

        <div className='space-y-2'>
            <div className="flex justify-between items-center">
                <h4 className="font-semibold">Session History</h4>
                <div className='flex gap-2'>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={contractions.length === 0}>
                                <Trash2 /> Clear
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete your current session history from this device. This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearSession}>Clear Session</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                     <Button variant="default" size="sm" onClick={handleSaveSession} disabled={contractions.length === 0}>
                        <Save /> Save Session
                    </Button>
                </div>
            </div>
            {contractions.length > 0 &&
                <div className='grid grid-cols-3 text-center text-sm bg-secondary/50 p-2 rounded-md'>
                    <div><p className='font-medium'>{formatDuration(avgDuration)}</p><p className='text-muted-foreground'>Avg. Duration</p></div>
                    <div><p className='font-medium'>{formatDuration(avgFrequency)}</p><p className='text-muted-foreground'>Avg. Frequency</p></div>
                    <div><p className={`font-medium ${isRegular ? 'text-green-600' : 'text-amber-600'}`}>{isRegular ? 'Regular' : 'Irregular'}</p><p className='text-muted-foreground'>Pattern</p></div>
                </div>
            }
            <ScrollArea className="h-48 border rounded-md">
                {contractions.length > 0 ? (
                    <div className='p-2 space-y-2'>
                        {contractions.slice().reverse().map((c, index) => (
                            <div key={c.startTime} className='p-2 rounded-md bg-secondary/30 grid grid-cols-4 items-center text-sm gap-2'>
                                <div className='font-medium'>
                                    {format(new Date(c.startTime), 'h:mm:ss a')}
                                </div>
                                <div className='text-muted-foreground'>
                                    <span className='font-semibold text-foreground'>{c.duration ? formatDuration(c.duration) : '--:--'}</span> dur.
                                </div>
                                 <div className='text-muted-foreground'>
                                    <span className='font-semibold text-foreground'>{c.interval ? formatDuration(c.interval) : '--:--'}</span> freq.
                                </div>
                                 <div className='text-muted-foreground'>
                                    Int: <span className='font-semibold text-foreground'>{c.intensity}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground pt-10">
                        <p>No contractions recorded yet.</p>
                        <p>Press "Start" to begin timing.</p>
                    </div>
                )}
            </ScrollArea>
        </div>

      </CardContent>
    </Card>
  );
}
