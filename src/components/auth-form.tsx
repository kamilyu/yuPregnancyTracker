"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { StorkLogo } from "@/components/logo";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    // Placeholder for Firebase auth logic
    console.log("Form submitted with:", values);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // This is where you would handle Firebase login or signup
    // For now, we'll simulate a success and redirect to the dashboard
    const isSuccess = true; // Simulate success

    setIsLoading(false);

    if (isSuccess) {
      toast({
        title: mode === "login" ? "Login Successful" : "Account Created",
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Please check your credentials and try again.",
      });
    }
  };

  const title = mode === "login" ? "Welcome Back" : "Create Your Account";
  const description =
    mode === "login"
      ? "Log in to continue your journey."
      : "Start your journey with StorkWatch today.";
  const buttonText = mode === "login" ? "Log In" : "Create Account";
  const alternativeText =
    mode === "login"
      ? "Don't have an account?"
      : "Already have an account?";
  const alternativeLink = mode === "login" ? "/signup" : "/login";
  const alternativeLinkText = mode === "login" ? "Sign Up" : "Log In";

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-block mb-4">
            <StorkLogo />
          </div>
          <h1 className="text-3xl font-headline font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {buttonText}
              </Button>
            </form>
          </Form>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {alternativeText}{" "}
          <Link
            href={alternativeLink}
            className="font-semibold text-primary hover:underline"
          >
            {alternativeLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
