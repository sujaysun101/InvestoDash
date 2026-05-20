import { redirect } from "next/navigation";

// /dashboard is the canonical entry point for the app — send users to the Kanban.
export default function DashboardPage() {
  redirect("/pipeline");
}
