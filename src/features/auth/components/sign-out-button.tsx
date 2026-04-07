"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const { signOut } = useClerk();

  return (
    <Button
      className="justify-start"
      onClick={() => signOut({ redirectUrl: "/" })}
      variant="ghost"
    >
      <LogOut />
      Sign Out
    </Button>
  );
}
