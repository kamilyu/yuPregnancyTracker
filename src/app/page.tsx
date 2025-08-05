import { SignIn } from "@/components/sign-in";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | yuPregnancy",
  description: "Log in to your yuPregnancy account.",
};

export default function LoginPage() {
  return <SignIn />;
}
