import { redirect } from "next/navigation";

// /dashboard is the canonical entry point for the app.
// Kanban pipeline lives at /pipeline; comparison at /compare.
export default function DashboardPage() {
  redirect("/pipeline");
}
