import { redirect } from "next/navigation";

// /dashboard is the canonical entry point — the app lives at /compare.
export default function DashboardPage() {
  redirect("/compare");
}
