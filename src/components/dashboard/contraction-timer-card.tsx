
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, serverTimestamp, query, orderBy, limit, onSnapshot, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Square, Timer, Trash2, HeartPulse, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, isValid } from 'date-fns';
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
  id?: string;
  startTime: number; // Unix timestamp
  endTime: number | null; // Unix timestamp
  duration: number | null; // seconds
  interval: number | null; // seconds from start of previous
  // For firestore data
  contractionStart?: Date;
  sessionDate?: Date;
};

function formatDuration(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const LOCAL_STORAGE_KEY = 'yupregnancy_contraction_session';

export function ContractionTimerCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isTiming, setIsTiming] = useState(false);
  const [currentSession, setCurrentSession] = useState<Contraction[]>([]);
  const [pastSessions, setPastSessions] = useState<Contraction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentDuration, setCurrentDuration] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load session from local storage on mount
  useEffect(() => {
    if (!user) return;
    try {
      const savedSession = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${user.uid}`);
      if (savedSession) {
        setCurrentSession(JSON.parse(savedSession));
      }
    } catch (error) {
      console.error("Failed to load session from local storage", error);
    }
  }, [user]);

  // Save current session to local storage on change
  useEffect(() => {
    if (!user) return;
    try {
        if (currentSession.length > 0) {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_${user.uid}`, JSON.stringify(currentSession));
        } else {
            localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${user.uid}`);
        }
    } catch (error) {
      console.error("Failed to save session to local storage", error);
    }
  }, [currentSession, user]);

  // Fetch past sessions from firestore
   useEffect(() => {
    if (!user) return;
    setLoadingHistory(true);
    const q = query(
        collection(db, 'users', user.uid, 'contractionTracking'), 
        orderBy('createdAt', 'desc'), 
        limit(50) // get a decent number of individual contractions
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sessions: Contraction[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            sessions.push({ 
                id: doc.id,
                 ...data,
                startTime: data.contractionStart?.toDate().getTime(),
                duration: data.duration,
                interval: data.intervalBetween,
            } as Contraction);
        });
        setPastSessions(sessions);
        setLoadingHistory(false);
    }, (error) => {
        console.error("Error fetching recent sessions:", error);
        setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [user]);


  const startTimer = useCallback(() => {
    const now = Date.now();
    const lastContraction = currentSession[currentSession.length - 1];
    const newContraction: Contraction = {
      startTime: now,
      endTime: null,
      duration: null,
      interval: lastContraction ? (now - lastContraction.startTime) / 1000 : null,
    };
    
    setCurrentSession(prev => [...prev, newContraction]);
    setIsTiming(true);
    setCurrentDuration(0);

    timerRef.current = setInterval(() => {
      setCurrentDuration(prev => prev + 1);
    }, 1000);
  }, [currentSession]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsTiming(false);
    
    setCurrentSession(prev => {
      const last = prev[prev.length - 1];
      if (last) {
        const updatedContraction = {
            ...last,
            endTime: Date.now(),
            duration: currentDuration,
        }
        return [...prev.slice(0, -1), updatedContraction];
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

  const handleClearCurrentSession = () => {
    if (isTiming) stopTimer();
    setCurrentSession([]);
    toast({
        title: "Session Cleared",
        description: "Your current contraction timing has been cleared.",
    });
  };

  const handleSaveSession = async () => {
    if (!user || currentSession.length === 0) {
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

        currentSession.forEach(c => {
            const newDocRef = doc(userContractionsCol);
            batch.set(newDocRef, {
                userId: user.uid,
                sessionDate: sessionDate, // Use the same date for the whole session
                contractionStart: new Date(c.startTime),
                contractionEnd: c.endTime ? new Date(c.endTime) : null,
                duration: c.duration,
                intervalBetween: c.interval,
                createdAt: serverTimestamp()
            });
        });

        await batch.commit();

        toast({
            title: "Session Saved!",
            description: `Successfully saved ${currentSession.length} contractions.`
        });
        // Clear local session after successful save
        setCurrentSession([]);

    } catch (error) {
        console.error("Error saving session: ", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save your session to the cloud. Your data is still safe on this device."
        })
    }
  };

  const handleDeleteContraction = async (id: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(db, 'users', user.uid, 'contractionTracking', id));
        toast({
            title: "Entry Deleted",
            description: "The contraction has been removed from your history."
        });
    } catch (error) {
        console.error("Error deleting contraction: ", error);
        toast({
            variant: "destructive",
            title: "Delete Failed",
            description: "Could not delete the entry. Please try again."
        });
    }
  };
  
  const allContractions = [...pastSessions.filter(ps => !currentSession.some(cs => cs.id === ps.id)), ...currentSession]
    .sort((a, b) => b.startTime - a.startTime);


  const calculateStats = (contractions: Contraction[]) => {
    if (contractions.length < 2) return { avgDuration: 0, avgFrequency: 0, isRegular: false };
    const validContractions = contractions.filter(c => c.duration !== null && c.duration > 0);
    if (validContractions.length < 2) return { avgDuration: 0, avgFrequency: 0, isRegular: false };
    
    const totalDuration = validContractions.reduce((acc, c) => acc + c.duration!, 0);
    const avgDuration = totalDuration / validContractions.length;

    const validIntervals = contractions.slice(1).map(c => c.interval).filter((i): i is number => i !== null && i > 0);
     if (validIntervals.length === 0) return { avgDuration, avgFrequency: 0, isRegular: false };

    const totalIntervalTime = validIntervals.reduce((acc, i) => acc + i!, 0);
    const avgFrequency = totalIntervalTime / validIntervals.length;

    const stdDev = Math.sqrt(validIntervals.map(x => Math.pow(x! - avgFrequency, 2)).reduce((a, b) => a + b) / validIntervals.length);
    const isRegular = stdDev < 60;

    return { avgDuration, avgFrequency, isRegular };
  }

  const { avgDuration, avgFrequency, isRegular } = calculateStats(currentSession);
  const lastContractionDuration = currentSession.length > 0 ? currentSession[currentSession.length - 1].duration : 0;

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
        <div className="flex flex-col items-center justify-center gap-4 p-4 bg-muted rounded-lg">
            <div className='text-6xl font-mono font-bold text-primary tabular-nums'>
                {formatDuration(isTiming ? currentDuration : lastContractionDuration ?? 0)}
            </div>
            <p className='text-muted-foreground'>
                {isTiming ? "Contraction in Progress..." : (currentSession.length > 0 ? "Last Contraction Duration" : "Start a new session")}
            </p>
            <Button onClick={handleStartStop} size="lg" className="w-48" variant={isTiming ? 'destructive' : 'default'}>
                {isTiming ? <Square className="mr-2"/> : <Play className="mr-2"/>}
                {isTiming ? 'Stop' : 'Start'}
            </Button>
        </div>
        
        <div className='space-y-2'>
            <div className="flex justify-between items-center">
                <h4 className="font-semibold">Session History</h4>
                <div className='flex gap-2'>
                     <Button variant="default" size="sm" onClick={handleSaveSession} disabled={currentSession.length === 0}>
                        <Save /> Save Session
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={currentSession.length === 0}>
                                <Trash2 /> Clear
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Clear current session?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will delete the current timed contractions from this device. This won't affect any sessions you've already saved.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearCurrentSession}>Clear Current</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            {currentSession.length > 0 &&
                <div className='grid grid-cols-3 text-center text-sm bg-muted p-2 rounded-md'>
                    <div><p className='font-medium'>{formatDuration(avgDuration)}</p><p className='text-muted-foreground'>Avg. Duration</p></div>
                    <div><p className='font-medium'>{formatDuration(avgFrequency)}</p><p className='text-muted-foreground'>Avg. Frequency</p></div>
                    <div><p className={`font-medium ${isRegular ? 'text-green-600' : 'text-amber-600'}`}>{isRegular ? 'Regular' : 'Irregular'}</p><p className='text-muted-foreground'>Pattern</p></div>
                </div>
            }
            <ScrollArea className="h-48 border rounded-md">
                {allContractions.length > 0 ? (
                    <div className='p-2 space-y-2'>
                        {allContractions.map((c) => (
                            <div key={c.id || c.startTime} className={`p-2 rounded-md ${currentSession.some(cs => cs.startTime === c.startTime) ? 'bg-primary/10' : 'bg-muted/50'} grid grid-cols-[1fr,auto,auto,auto] items-center text-sm gap-2`}>
                                <div className='font-medium'>
                                    {isValid(new Date(c.startTime)) ? format(new Date(c.startTime), 'h:mm:ss a') : '--:--:--'}
                                </div>
                                <div className='text-muted-foreground'>
                                    <span className='font-semibold text-foreground'>{c.duration ? formatDuration(c.duration) : '--:--'}</span> dur.
                                </div>
                                 <div className='text-muted-foreground'>
                                    <span className='font-semibold text-foreground'>{c.interval ? formatDuration(c.interval) : '--:--'}</span> freq.
                                </div>
                                {c.id && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete this contraction from your history.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteContraction(c.id!)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground pt-10">
                        {loadingHistory ? <p>Loading history...</p> :
                        <>
                            <p>No contractions recorded yet.</p>
                            <p>Press "Start" to begin timing.</p>
                        </>
                        }
                    </div>
                )}
            </ScrollArea>
        </div>

      </CardContent>
    </Card>
  );
}
