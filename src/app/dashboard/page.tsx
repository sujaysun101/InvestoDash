import { redirect } from "next/navigation";

// /dashboard is a short alias for the signed-in workspace (pipeline + tools).
export default function DashboardPage() {
  redirect("/workspace");
}
