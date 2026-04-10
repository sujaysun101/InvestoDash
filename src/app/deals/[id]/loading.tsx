import { Skeleton } from "@/components/ui/skeleton";

export default function DealLoading() {
  return (
    <div className="flex flex-col gap-8 px-6 py-8 lg:px-10">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 w-full max-w-xl" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
