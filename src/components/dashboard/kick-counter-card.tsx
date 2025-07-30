
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Flame, Footprints, History, Play, Square, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNowStrict, isValid } from 'date-fns';

type KickSession = {
  id?: string;
  userId: string;
  sessionDate: any; // Firestore Timestamp
  startTime: any; // Firestore Timestamp
  endTime: any; // Firestore Timestamp
  kickCount: number;
  sessionDuration: number; // in seconds
};

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

export function KickCounterCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recentSessions, setRecentSessions] = useState<KickSession[]>([]);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const startTimer = useCallback(() => {
    startTimeRef.current = new Date();
    timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
            setElapsedTime(Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000));
        }
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(
        collection(db, 'users', user.uid, 'kickTracking'), 
        orderBy('sessionDate', 'desc'), 
        limit(10)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sessions: KickSession[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            sessions.push({ 
                id: doc.id,
                 ...data,
                // Ensure timestamps are converted to dates for display
                sessionDate: data.sessionDate?.toDate(),
                startTime: data.startTime?.toDate(),
                endTime: data.endTime?.toDate(),
            } as KickSession);
        });
        setRecentSessions(sessions);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching recent sessions:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch recent kick sessions."
        });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  useEffect(() => {
    return () => stopTimer(); // Cleanup timer on component unmount
  }, [stopTimer]);

  const handleStartSession = () => {
    setIsSessionActive(true);
    setKickCount(0);
    setElapsedTime(0);
    startTimer();
  };

  const handleStopSession = async () => {
    stopTimer();
    setIsSessionActive(false);

    if (kickCount === 0 || !startTimeRef.current) {
        toast({
            variant: "default",
            title: "Session Canceled",
            description: "No kicks were recorded.",
        });
        return;
    }

    const endTime = new Date();
    const newSession: Omit<KickSession, 'id'> = {
        userId: user!.uid,
        sessionDate: serverTimestamp(),
        startTime: startTimeRef.current,
        endTime: endTime,
        kickCount: kickCount,
        sessionDuration: elapsedTime,
    };

    try {
        await addDoc(collection(db, 'users', user!.uid, 'kickTracking'), newSession);
        toast({
            title: "Session Saved!",
            description: `You recorded ${kickCount} kicks in ${formatDuration(elapsedTime)}.`,
        })
    } catch (error) {
        console.error("Error saving session: ", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save your session. Please try again.",
        })
    }
    
    // Reset state
    setKickCount(0);
    setElapsedTime(0);
    startTimeRef.current = null;
  };

  const handleKick = () => {
    if (!isSessionActive) return;
    setKickCount(prev => prev + 1);
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline flex items-center gap-2">
            <Footprints className="text-primary" />
            Kick Counter
          </CardTitle>
          <CardDescription>Track your baby's movements.</CardDescription>
        </div>
        <Popover>
            <PopoverTrigger asChild>
                 <Button variant="ghost" size="icon" disabled={recentSessions.length === 0}>
                    <History className="h-5 w-5" />
                    <span className="sr-only">View History</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Recent Sessions</h4>
                        <p className="text-sm text-muted-foreground">
                        Your last 10 sessions.
                        </p>
                    </div>
                    <ScrollArea className="h-64">
                         {recentSessions.length > 0 ? (
                            <div className="grid gap-2 pr-4">
                               {recentSessions.map(session => (
                                   <div key={session.id} className="grid grid-cols-[1fr_auto] items-center gap-4 text-sm">
                                       <div>
                                            <p className='font-medium'>{session.kickCount} kicks in {formatDuration(session.sessionDuration)}</p>
                                            {isValid(session.sessionDate) && (
                                                <p className='text-muted-foreground'>{formatDistanceToNowStrict(session.sessionDate)} ago</p>
                                            )}
                                       </div>
                                   </div>
                               ))}
                            </div>
                         ) : <p className="text-sm text-muted-foreground text-center py-4">No recent sessions found.</p>}
                    </ScrollArea>
                </div>
            </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        {isSessionActive ? (
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleKick}
              className="w-48 h-48 rounded-full text-2xl flex flex-col shadow-lg"
              variant="secondary"
            >
              <span className="font-bold text-5xl">{kickCount}</span>
              <span className="text-lg">Tap to count</span>
            </Button>
            <div className='flex items-center gap-4 text-muted-foreground'>
                <div className='flex items-center gap-1'>
                    <Timer className='w-4 h-4' />
                    <span>{formatDuration(elapsedTime)}</span>
                </div>
                 <Button onClick={handleStopSession} variant="destructive" size="sm">
                    <Square className="mr-2" />
                    Stop Session
                </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 bg-secondary/30 rounded-lg">
            <p className="text-muted-foreground mb-4">Ready to start counting kicks?</p>
            <Button onClick={handleStartSession} size="lg">
              <Play className="mr-2" />
              Start New Session
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
