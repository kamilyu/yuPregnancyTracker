
"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, NotebookText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";

type LogEntry = {
  id: string;
  date: Date;
  notes: string;
};

export function SymptomLogCard() {
  const [notes, setNotes] = useState("");
  // In a real app, this would be fetched from and updated to Firestore.
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const { toast } = useToast();

  const handleAddLog = () => {
    if (notes.trim() === "") {
        toast({
            variant: "destructive",
            title: "Empty Note",
            description: "Please write something before saving.",
        })
      return;
    }
    const newEntry: LogEntry = {
      id: new Date().toISOString(), // Use a proper unique ID in production
      date: new Date(),
      notes: notes.trim(),
    };

    // Add Firestore save logic here
    setLogEntries([newEntry, ...logEntries]);
    setNotes("");
    toast({
        title: "Note Saved",
        description: "Your thoughts have been logged."
    })
  };

  return (
    <Card className="flex flex-col">
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
        />
        <Button onClick={handleAddLog} className="self-start">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Log Entry
        </Button>
        <div className="flex-grow mt-4">
          <h4 className="font-semibold mb-2">Recent Entries</h4>
          <ScrollArea className="h-48 pr-4 border-t">
            {logEntries.length > 0 ? (
                <div className="space-y-4 py-4">
                    {logEntries.map((entry) => (
                        <div key={entry.id} className="text-sm">
                            <p className="font-semibold">{format(entry.date, 'MMMM d, yyyy')}</p>
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
      </CardContent>
    </Card>
  );
}
