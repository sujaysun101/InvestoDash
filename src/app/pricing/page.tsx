import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PricingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Pricing</p>
        <h1 className="mt-2 text-4xl font-semibold">Pro plan</h1>
        <p className="mt-2 text-muted-foreground">
          Placeholder page — connect billing when you are ready to launch.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>InvestoDash Pro — $29/mo</CardTitle>
          <CardDescription>Unlimited analyses and full diligence exports.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
