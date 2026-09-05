#!/usr/bin/env node
/**
 * Guards against the recurring regression where /dashboard redirects to /compare
 * and sidebar nav links both point to compare.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const errors = [];

function read(relPath) {
  return readFileSync(join(root, relPath), "utf8");
}

const dashboard = read("src/app/dashboard/page.tsx");
if (dashboard.includes('redirect("/compare")')) {
  errors.push("/dashboard must render DealBoard, not redirect to /compare");
}
if (!dashboard.includes("DealBoard")) {
  errors.push("/dashboard must import and render DealBoard");
}

const navLinks = read("src/components/app-nav-links.tsx");
if (!navLinks.includes('href: "/dashboard"') || !navLinks.includes('"Pipeline"')) {
  errors.push('AppNavLinks must link Pipeline to /dashboard');
}
if (!navLinks.includes('href: "/compare"') || !navLinks.includes('"Compare Deals"')) {
  errors.push('AppNavLinks must link Compare Deals to /compare');
}

const postLoginTargets = [
  "src/app/auth/post-login/page.tsx",
  "src/features/auth/components/post-login-resolver.tsx",
  "src/app/api/demo-login/route.ts",
  "src/features/auth/components/thesis-onboarding-form.tsx",
];

for (const file of postLoginTargets) {
  const content = read(file);
  if (content.includes('"/compare"') && !content.includes("//")) {
    // Allow compare in comments only — check for redirect/push patterns
    if (
      /redirect\(["']\/compare["']\)/.test(content) ||
      /push\(["']\/compare["']\)/.test(content) ||
      /NextResponse\.redirect\([^)]*\/compare/.test(content)
    ) {
      errors.push(`${file} must not redirect/post-login to /compare`);
    }
  }
}

if (errors.length > 0) {
  console.error("Navigation guard failed:\n");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log("Navigation guard passed.");
