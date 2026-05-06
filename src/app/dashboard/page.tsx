import { redirect } from "next/navigation";

// /dashboard is a legacy entry — workspace pipeline lives at /pipeline.
export default function DashboardPage() {
  redirect("/pipeline");
}
