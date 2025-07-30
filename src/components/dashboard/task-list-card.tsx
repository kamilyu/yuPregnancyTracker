
"use client";

import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { pregnancyTasks } from "@/data/pregnancy-data";
import { CheckCircle2 } from "lucide-react";

type TaskListCardProps = {
  currentTrimester: number;
};

export function TaskListCard({ currentTrimester }: TaskListCardProps) {
  // In a real app, checked state would be fetched from and updated to Firestore.
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const handleCheckChange = (taskId: string) => {
    setCheckedTasks((prev) => {
        const newCheckedState = {...prev, [taskId]: !prev[taskId]};
        // Add Firestore save logic here
        console.log("Updated checked tasks:", newCheckedState);
        return newCheckedState;
    });
  };

  const defaultAccordionValue = useMemo(() => `trimester-${currentTrimester}`, [currentTrimester]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <CheckCircle2 className="text-primary" />
            Appointments & Tasks
        </CardTitle>
        <CardDescription>
          A helpful checklist for your pregnancy journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={defaultAccordionValue} className="w-full">
          {pregnancyTasks.map((trimester) => (
            <AccordionItem value={`trimester-${trimester.trimester}`} key={trimester.trimester}>
              <AccordionTrigger className="font-semibold">
                {trimester.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {trimester.tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={task.id}
                        checked={!!checkedTasks[task.id]}
                        onCheckedChange={() => handleCheckChange(task.id)}
                      />
                      <label
                        htmlFor={task.id}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${checkedTasks[task.id] ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.text}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
