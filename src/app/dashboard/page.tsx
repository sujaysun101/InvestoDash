import { redirect } from "next/navigation";

// /dashboard is a short alias for the signed-in workspace entry.
export default function DashboardPage() {
  redirect("/pipeline");
}
