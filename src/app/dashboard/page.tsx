import { redirect } from "next/navigation";

// /dashboard is the canonical entry point for the app.
// The deal comparison view lives at /compare — redirect there.
export default function DashboardPage() {
  redirect("/compare");
}
