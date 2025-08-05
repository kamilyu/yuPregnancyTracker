
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "firebase/firestore";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, NotebookText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";

type LogEntry = {
  id: string;
  date: Date;
  notes: string;
};

export function SymptomLogCard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState("");
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    const q = query(
        collection(db, 'users', user.uid, 'symptomLogs'), 
        orderBy('createdAt', 'desc'), 
        limit(50)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const entries: LogEntry[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({
                id: doc.id,
                notes: data.notes,
                date: data.createdAt.toDate(),
            });
        });
        setLogEntries(entries);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching logs: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch your notes."
        });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleAddLog = async () => {
    if (notes.trim() === "" || !user) {
        toast({
            variant: "destructive",
            title: "Empty Note",
            description: "Please write something before saving.",
        })
      return;
    }

    try {
        await addDoc(collection(db, 'users', user.uid, 'symptomLogs'), {
            notes: notes.trim(),
            createdAt: serverTimestamp()
        });
        setNotes("");
        toast({
            title: "Note Saved",
            description: "Your thoughts have been logged."
        });
    } catch (error) {
         console.error("Error adding log: ", error);
         toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save your note. Please try again.",
        })
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <NotebookText className="text-primary"/>
            Notes & Symptoms
        </CardTitle>
        <CardDescription>Log your daily feelings and experiences.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <Textarea
          placeholder="How are you feeling today?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-28"
          disabled={!user}
        />
        <Button onClick={handleAddLog} className="self-start" disabled={!user || notes.trim() === ""}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Log Entry
        </Button>
        <div className="flex-grow mt-4 flex flex-col">
          <h4 className="font-semibold mb-2">Recent Entries</h4>
          <div className="relative flex-grow">
            <ScrollArea className="absolute inset-0 pr-4">
              {loading ? (
                  <div className="space-y-4 py-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                  </div>
              ) : logEntries.length > 0 ? (
                  <div className="space-y-4 py-4">
                      {logEntries.map((entry) => (
                          <div key={entry.id} className="text-sm p-2 rounded-md bg-secondary/30">
                              <p className="font-semibold">{format(entry.date, 'MMMM d, yyyy - h:mm a')}</p>
                              <p className="text-muted-foreground whitespace-pre-wrap">{entry.notes}</p>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center text-muted-foreground pt-10">
                      <p>No entries yet.</p>
                      <p>Add a note to start your journal.</p>
                  </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
