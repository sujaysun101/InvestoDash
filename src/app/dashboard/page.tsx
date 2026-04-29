import { redirect } from "next/navigation";

// /dashboard is the canonical entry point for the app shell.
export default function DashboardPage() {
  redirect("/pipeline");
}
