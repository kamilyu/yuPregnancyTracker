
"use client";

import { differenceInDays, differenceInWeeks, format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Calendar as CalendarIcon, Edit } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type DueDateCardProps = {
  dueDate: Date | null;
  setDueDate: (date: Date | null) => void;
};

export function DueDateCard({ dueDate, setDueDate }: DueDateCardProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(dueDate ?? undefined);
    const { toast } = useToast();
    const today = new Date();

    const handleSave = () => {
        if (selectedDate) {
            // Add Firestore save logic here
            setDueDate(selectedDate);
            toast({
                title: "Due Date Saved!",
                description: `Your due date is set to ${format(selectedDate, "PPP")}.`,
            })
            setDialogOpen(false);
        }
    };
    
    if (!dueDate) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-8 bg-secondary">
                 <CalendarIcon className="w-12 h-12 text-primary mb-4" />
                 <h3 className="text-xl font-headline font-semibold">Welcome to StorkWatch!</h3>
                 <p className="text-muted-foreground mt-2 mb-4">Set your due date to get started.</p>
                 <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Set Your Due Date</Button>
                    </DialogTrigger>
                    <DueDateDialogContent 
                        selectedDate={selectedDate} 
                        setSelectedDate={setSelectedDate} 
                        handleSave={handleSave} 
                    />
                 </Dialog>
            </Card>
        )
    }

    const weeksPregnant = 40 - differenceInWeeks(dueDate, today);
    const daysRemaining = differenceInDays(dueDate, today);

    const trimester = weeksPregnant <= 13 ? 1 : weeksPregnant <= 27 ? 2 : 3;

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Your Journey</CardTitle>
        <CardDescription>
          Due Date: {format(dueDate, "MMMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-primary">{weeksPregnant}</p>
          <p className="text-sm text-muted-foreground">Weeks</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-primary">{daysRemaining}</p>
          <p className="text-sm text-muted-foreground">Days to Go</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-primary">{trimester}</p>
          <p className="text-sm text-muted-foreground">Trimester</p>
        </div>
      </CardContent>
       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit due date</span>
                </Button>
            </DialogTrigger>
            <DueDateDialogContent 
                selectedDate={selectedDate} 
                setSelectedDate={setSelectedDate} 
                handleSave={handleSave} 
            />
        </Dialog>
    </Card>
  );
}

function DueDateDialogContent({selectedDate, setSelectedDate, handleSave}: {selectedDate: Date | undefined, setSelectedDate: (date: Date | undefined) => void, handleSave: () => void}) {
    return (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Your Due Date</DialogTitle>
            <DialogDescription>
              Select your estimated due date. You can change this at any time.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
             <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) =>
                  date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 10))
                }
                initialFocus
              />
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={!selectedDate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
    )
}
