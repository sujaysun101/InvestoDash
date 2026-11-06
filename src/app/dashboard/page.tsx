import { redirect } from "next/navigation";

// /dashboard redirects to the Kanban pipeline; comparison lives at /compare.
export default function DashboardPage() {
  redirect("/pipeline");
}
