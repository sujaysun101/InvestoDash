"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Pipeline", match: (path: string) => path === "/dashboard" },
  {
    href: "/compare",
    label: "Compare Deals",
    match: (path: string) => path === "/compare",
  },
  {
    href: "/onboarding",
    label: "Investment Thesis",
    match: (path: string) => path === "/onboarding",
  },
  { href: "/login", label: "Account", match: (path: string) => path === "/login" },
] as const;

export function AppNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);

        return (
          <Button
            key={item.href}
            asChild
            className={cn(
              "justify-start",
              active && "bg-secondary/60 text-foreground hover:bg-secondary/60",
            )}
            variant="ghost"
          >
            <Link aria-current={active ? "page" : undefined} href={item.href}>
              {item.label}
            </Link>
          </Button>
        );
      })}
    </>
  );
}
