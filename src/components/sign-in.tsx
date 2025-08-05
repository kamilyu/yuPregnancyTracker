
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { StorkLogo } from "@/components/logo";
import { Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";

export function SignIn() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // New user, create a document in Firestore
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          dueDate: null,
          pregnancyStartDate: null,
          journalStreak: 0,
          longestJournalStreak: 0,
          lastJournalEntry: null
        });
      }
      
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");

    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-block mb-4">
            <StorkLogo />
          </div>
          <h1 className="text-3xl font-headline font-bold">Welcome to StorkWatch</h1>
          <p className="text-muted-foreground">Sign in with Google to begin your journey.</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 text-center">
          <Button onClick={handleSignIn} disabled={isLoading} size="lg">
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
}

    