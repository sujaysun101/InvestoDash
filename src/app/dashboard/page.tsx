import { redirect } from "next/navigation";

// /dashboard is a legacy entry point — redirect to the Kanban pipeline.
export default function DashboardPage() {
  redirect("/pipeline");
}
