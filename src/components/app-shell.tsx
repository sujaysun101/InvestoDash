import { AppShellLayout } from "@/components/app-shell-layout";
import { ThesisProfile, UsageCounter } from "@/lib/types";

export function AppShell({
  children,
  thesis,
  usage,
  userEmail,
}: Readonly<{
  children: React.ReactNode;
  thesis: ThesisProfile | null;
  usage: UsageCounter;
  userEmail: string | null;
}>) {
  return (
    <AppShellLayout thesis={thesis} usage={usage} userEmail={userEmail}>
      {children}
    </AppShellLayout>
  );
}
