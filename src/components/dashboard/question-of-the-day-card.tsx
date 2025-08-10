
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Sparkles } from "lucide-react";
import { questionOfTheDayData } from "@/data/question-data";
import { getDayOfYear } from "date-fns";

export function QuestionOfTheDayCard() {
  const today = new Date();
  const dayIndex = getDayOfYear(today) % questionOfTheDayData.length;
  const question = questionOfTheDayData[dayIndex];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <HelpCircle className="text-primary" />
          Question of the Day
        </CardTitle>
        <CardDescription>
          A new question to help you learn every day.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-semibold text-lg">{question.question}</p>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <span className="flex items-center gap-2 text-primary font-semibold">
                <Sparkles className="w-4 h-4" />
                Reveal the Answer
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pt-2">
              {question.answer}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
