import { SignIn } from "@/components/sign-in";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | StorkWatch",
  description: "Log in to your StorkWatch account.",
};

export default function LoginPage() {
  return <SignIn />;
}
