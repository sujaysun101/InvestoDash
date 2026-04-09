import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthSessionRedirect } from "@/features/auth/components/auth-session-redirect";
import { TestAuthForm } from "@/features/auth/components/test-auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function TestLoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <AuthSessionRedirect redirectTo="/dashboard" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">InvestoDash Test</CardTitle>
          <CardDescription>
            This environment only accepts the test account credentials. No email
            confirmation flow is required here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TestAuthForm />
          <Link
            className="text-sm text-primary underline-offset-4 hover:underline"
            href="/login"
          >
            Go to regular InvestoDash login
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
