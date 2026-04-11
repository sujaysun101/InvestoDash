import { PipelineStage } from "@/lib/types";

export function AgeBadge({
  dateAdded,
  stage,
}: {
  dateAdded: string;
  stage: PipelineStage;
}) {
  if (stage === "Passed" || stage === "Invested") return null;

  const daysSince = Math.floor(
    (Date.now() - new Date(dateAdded).getTime()) / 86_400_000,
  );

  if (daysSince < 14) return null;
  if (daysSince < 30) {
    return (
      <span
        className="text-xs text-yellow-500"
        title={`${daysSince} days in pipeline`}
      >
        ⏱ {daysSince}d
      </span>
    );
  }
  return (
    <span
      className="text-xs text-red-400"
      title={`${daysSince} days — needs decision`}
    >
      🔴 {daysSince}d
    </span>
  );
}
