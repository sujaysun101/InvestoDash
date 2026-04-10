import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-primary">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The deal or page you were looking for does not exist, or you may not have access.
      </p>
      <Button asChild className="mt-8">
        <Link href="/dashboard">← Back to Dashboard</Link>
      </Button>
    </div>
  );
}
