import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StorkLogo } from "@/components/logo";
import { Baby, Calendar, CheckCircle, HeartHandshake, NotebookText, Sparkles } from "lucide-react";
import { SignInButton } from "@/components/sign-in-button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <StorkLogo />
        <SignInButton />
      </header>

      <main className="flex-1">
        <section className="relative py-20 md:py-32 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="absolute top-10 left-10 opacity-20">
              <Sparkles className="w-16 h-16 text-primary/50" />
            </div>
             <div className="absolute bottom-10 right-10 opacity-20">
              <Baby className="w-16 h-16 text-accent/80" />
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-slate-800">
              Embrace the Journey of Motherhood
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
              StorkWatch is your personal companion, guiding you through every
              milestone of your pregnancy with weekly insights, tracking tools,
              and a supportive community.
            </p>
            <div className="mt-8">
               <SignInButton />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-bold text-slate-800">
                All-in-One Pregnancy Tracking
              </h2>
              <p className="mt-2 text-md text-slate-500 max-w-xl mx-auto">
                From the first kick to the final countdown, we've got you covered.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Calendar className="w-8 h-8 text-primary" />}
                title="Due Date Tracking"
                description="Stay updated with your baby's gestational age and a countdown to your special day."
              />
              <FeatureCard
                icon={<Baby className="w-8 h-8 text-primary" />}
                title="Weekly Development"
                description="Discover the miracle of life with scientifically-backed updates on your baby's growth."
              />
              <FeatureCard
                icon={<HeartHandshake className="w-8 h-8 text-primary" />}
                title="Size Visualization"
                description="Visualize your baby's size with cute, relatable comparisons to fruits and veggies."
              />
              <FeatureCard
                icon={<NotebookText className="w-8 h-8 text-primary" />}
                title="Symptom & Note Logging"
                description="Keep a private journal of your symptoms, thoughts, and precious moments."
              />
              <FeatureCard
                icon={<CheckCircle className="w-8 h-8 text-primary" />}
                title="Task Management"
                description="Never miss an important appointment or task with our handy checklists."
              />
               <FeatureCard
                icon={<Sparkles className="w-8 h-8 text-primary" />}
                title="AI-Powered Insights"
                description="Get personalized and relevant information about your pregnancy journey."
              />
            </div>
          </div>
        </section>

         <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="md:w-1/2">
                <Image
                  src="https://placehold.co/600x600.png"
                  alt="Happy pregnant woman"
                  data-ai-hint="happy pregnant woman"
                  width={600}
                  height={600}
                  className="rounded-lg shadow-xl"
                />
              </div>
              <div className="md:w-1/2 text-center md:text-left">
                 <h2 className="text-3xl font-headline font-bold text-slate-800">
                  Ready to Begin?
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Join thousands of expecting parents who trust StorkWatch. Create your account today and start cherishing every moment of your pregnancy.
                </p>
                <div className="mt-6">
                   <SignInButton />
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-slate-800 text-slate-300 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <StorkLogo light />
            <p className="mt-4 text-sm">
            &copy; {new Date().getFullYear()} StorkWatch. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
}


function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="mx-auto bg-secondary/80 rounded-full w-16 h-16 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="mt-4 text-xl font-headline font-semibold text-slate-800">{title}</h3>
        <p className="mt-2 text-slate-500">{description}</p>
      </CardContent>
    </Card>
  )
}
