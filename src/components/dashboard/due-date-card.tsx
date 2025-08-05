
"use client";

import { addWeeks, differenceInDays, differenceInWeeks, format } from "date-fns";
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
    // This state will now hold the Last Menstrual Period date
    const [selectedLMP, setSelectedLMP] = useState<Date | undefined>(undefined);
    const { toast } = useToast();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    const handleSave = () => {
        if (selectedLMP) {
            const calculatedDueDate = addWeeks(selectedLMP, 40);
            setDueDate(calculatedDueDate);
            toast({
                title: "Due Date Saved!",
                description: `Based on your last period, your estimated due date is ${format(calculatedDueDate, "PPP")}.`,
            })
            setDialogOpen(false);
        }
    };
    
    if (!dueDate) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-8 bg-secondary">
                 <CalendarIcon className="w-12 h-12 text-primary mb-4" />
                 <h3 className="text-xl font-headline font-semibold">Welcome to yuPregnancy!</h3>
                 <p className="text-muted-foreground mt-2 mb-4">Let's calculate your due date to get started.</p>
                 <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Calculate Your Due Date</Button>
                    </DialogTrigger>
                    <DueDateDialogContent 
                        selectedDate={selectedLMP} 
                        setSelectedDate={setSelectedLMP} 
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
          Estimated Due Date: {format(dueDate, "MMMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-primary">{weeksPregnant}</p>
          <p className="text-sm text-muted-foreground">Weeks</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-primary">{daysRemaining > 0 ? daysRemaining : 0}</p>
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
                selectedDate={selectedLMP} 
                setSelectedDate={setSelectedLMP} 
                handleSave={handleSave} 
            />
        </Dialog>
    </Card>
  );
}

function DueDateDialogContent({selectedDate, setSelectedDate, handleSave}: {selectedDate: Date | undefined, setSelectedDate: (date: Date | undefined) => void, handleSave: () => void}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nineMonthsAgo = new Date();
    nineMonthsAgo.setMonth(nineMonthsAgo.getMonth() - 9);

    return (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Calculate Your Due Date</DialogTitle>
            <DialogDescription>
              Select the first day of your last menstrual period. We'll estimate your due date from there.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
             <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) =>
                    date > today || date < nineMonthsAgo
                }
                initialFocus
                defaultMonth={selectedDate || new Date()}
              />
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={!selectedDate}>Calculate and Save</Button>
          </DialogFooter>
        </DialogContent>
    )
}
