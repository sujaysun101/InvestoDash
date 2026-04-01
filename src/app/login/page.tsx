import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">InvestoDash</CardTitle>
          <CardDescription>
            Sign in with Google to manage pipeline, analysis, and conviction
            across every startup you review.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <GoogleAuthButton />
          <p className="text-sm text-muted-foreground">
            After your first login, you&apos;ll be prompted to complete your
            investment thesis profile.
          </p>
          <Link
            className="text-sm text-primary underline-offset-4 hover:underline"
            href="/"
          >
            Preview the product shell
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
