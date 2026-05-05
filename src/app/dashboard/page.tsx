import { redirect } from "next/navigation";

// /dashboard is a legacy entry — canonical workspace starts at /pipeline.
export default function DashboardPage() {
  redirect("/pipeline");
}
