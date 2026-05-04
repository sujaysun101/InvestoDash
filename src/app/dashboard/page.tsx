import { redirect } from "next/navigation";

// /dashboard is a legacy entry point — canonical workspace is the pipeline.
export default function DashboardPage() {
  redirect("/pipeline");
}
