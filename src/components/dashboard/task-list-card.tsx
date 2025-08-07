"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
import { CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskListCardProps = {
  currentTrimester: number;
};

export function TaskListCard({ currentTrimester }: TaskListCardProps) {
  const { user } = useAuth();
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCheckedTasks = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().checkedTasks) {
          setCheckedTasks(userDoc.data().checkedTasks);
        }
      }
    };
    fetchCheckedTasks();
  }, [user]);

  const handleCheckChange = async (taskId: string) => {
    if (!user) return;

    const newCheckedState = {...checkedTasks, [taskId]: !checkedTasks[taskId]};
    setCheckedTasks(newCheckedState);
    
    try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { checkedTasks: newCheckedState }, { merge: true });
    } catch (error) {
        console.error("Error saving checked tasks:", error);
        // Optionally revert state and show toast
    }
  };

  const defaultAccordionValue = useMemo(() => `trimester-${currentTrimester}`, [currentTrimester]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <CheckCircle2 className="text-primary" />
            Trimester Checklist
        </CardTitle>
        <CardDescription>
          A helpful checklist for your pregnancy journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={defaultAccordionValue} className="w-full">
          {pregnancyTasks.map((trimester) => {
            const isLocked = trimester.trimester > currentTrimester;
            return (
              <AccordionItem value={`trimester-${trimester.trimester}`} key={trimester.trimester} disabled={isLocked}>
                <AccordionTrigger className={cn("font-semibold", isLocked && "text-muted-foreground hover:no-underline cursor-not-allowed")}>
                    <div className="flex items-center gap-2">
                        {isLocked && <Lock className="w-4 h-4" />}
                        {trimester.title}
                        {isLocked && <span className="text-xs font-normal ml-2">(Coming Soon)</span>}
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {trimester.tasks.map((task) => (
                      task.isHeading ? (
                        <h4 key={task.id} className="font-semibold text-primary/90 pt-2">{task.text}</h4>
                      ) : (
                        <div key={task.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={task.id}
                            checked={!!checkedTasks[task.id]}
                            onCheckedChange={() => handleCheckChange(task.id)}
                            disabled={!user}
                          />
                          <label
                            htmlFor={task.id}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${checkedTasks[task.id] ? "line-through text-muted-foreground" : ""}`}
                          >
                            {task.text}
                          </label>
                        </div>
                      )
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
