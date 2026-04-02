"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DemoLoginButton() {
  const [loading, setLoading] = useState(false);

  async function handleDemoLogin() {
    setLoading(true);

    try {
      const response = await fetch("/api/demo-login", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Internal demo login is not available on this deployment.");
      }

      const data = (await response.json()) as { redirectTo: string };
      window.location.href = data.redirectTo;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Demo login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button className="w-full" disabled={loading} onClick={handleDemoLogin} variant="ghost">
      <FlaskConical />
      {loading ? "Opening internal demo..." : "Internal Demo Login"}
    </Button>
  );
}
