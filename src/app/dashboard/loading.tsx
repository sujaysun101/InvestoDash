import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 px-6 py-8 lg:px-10">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="grid gap-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[420px] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
