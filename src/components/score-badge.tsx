import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function neutralBadge(label: string, className?: string) {
  return (
    <Badge
      variant="outline"
      className={cn("border-border/50 text-muted-foreground", className)}
    >
      {label} —
    </Badge>
  );
}

export function ScoreBadge({
  label,
  score,
  className,
  kind = "fit",
}: {
  label: string;
  score: number | null;
  className?: string;
  kind?: "fit" | "risk";
}) {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return neutralBadge(label, className);
  }

  const fitColors =
    score >= 7
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
      : score >= 4
        ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-400"
        : "border-red-400/30 bg-red-400/10 text-red-400";

  const riskColors =
    score >= 7
      ? "border-red-400/30 bg-red-400/10 text-red-400"
      : score >= 4
        ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-400"
        : "border-emerald-400/30 bg-emerald-400/10 text-emerald-400";

  const color = kind === "risk" ? riskColors : fitColors;

  return (
    <Badge className={cn(color, className)}>
      {label} {score}
    </Badge>
  );
}
