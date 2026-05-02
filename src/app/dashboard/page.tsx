import { redirect } from "next/navigation";

// /dashboard is the canonical entry point for the app.
// Pipeline Kanban is the primary workspace; comparison lives at /compare.
export default function DashboardPage() {
  redirect("/pipeline");
}
