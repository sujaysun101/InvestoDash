"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Pipeline" },
  { href: "/compare", label: "Compare Deals" },
  { href: "/onboarding", label: "Investment Thesis" },
  { href: "/login", label: "Account" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map(({ href, label }) => {
        const isActive =
          pathname === href ||
          (href === "/dashboard" && pathname.startsWith("/deals"));

        return (
          <Button
            key={href}
            asChild
            className={cn("justify-start", isActive && "bg-primary/10 text-primary")}
            variant="ghost"
          >
            <Link href={href}>{label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
