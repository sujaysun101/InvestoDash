import { redirect } from "next/navigation";

// /dashboard is a short alias for the main app shell.
export default function DashboardPage() {
  redirect("/pipeline");
}
