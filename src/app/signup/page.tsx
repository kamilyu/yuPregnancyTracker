import { AuthForm } from "@/components/auth-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | StorkWatch",
  description: "Create your free StorkWatch account.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
