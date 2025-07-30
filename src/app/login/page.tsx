import { AuthForm } from "@/components/auth-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | StorkWatch",
  description: "Log in to your StorkWatch account.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
