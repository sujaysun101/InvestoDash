"use client";

import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ScoreBadge } from "@/components/score-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgeBadge } from "@/features/deals/components/age-badge";
import { PIPELINE_STAGES, SECTORS, STAGES } from "@/lib/constants";
import { formatDate } from "@/lib/format-date";
import { createClient } from "@/lib/supabase/client";
import { Deal, PipelineStage } from "@/lib/types";

function DraggableDealCard({
  deal,
  children,
}: {
  deal: Deal;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: deal.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-60" : undefined}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

function StageColumn({
  stage,
  isOver,
  children,
}: {
  stage: PipelineStage;
  isOver: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: stage });

  return (
    <div ref={setNodeRef}>
      <Card
        className={`min-h-[520px] border-border/70 bg-gradient-to-b from-card to-card/70 ${
          isOver ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
        }`}
      >
        {children}
      </Card>
    </div>
  );
}

export function DealBoard({
  deals,
  onUploadDeck,
}: {
  deals: Deal[];
  onUploadDeck: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<PipelineStage | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!deal.company_name.toLowerCase().includes(q)) return false;
      }
      if (sectorFilter.length > 0 && !sectorFilter.includes(deal.sector)) {
        return false;
      }
      if (stageFilter !== "all" && deal.stage !== stageFilter) return false;
      if (scoreFilter !== "all") {
        const min = Number.parseInt(scoreFilter, 10);
        const f =
          deal.fit_score ?? deal.analysis?.thesis_fit_score ?? null;
        if (f == null || f < min) return false;
      }
      return true;
    });
  }, [deals, search, sectorFilter, stageFilter, scoreFilter]);

  function toggleSector(s: string) {
    setSectorFilter((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    );
  }

  function resolveStage(overId: string | undefined): PipelineStage | undefined {
    if (!overId) return undefined;
    if (PIPELINE_STAGES.includes(overId as PipelineStage)) {
      return overId as PipelineStage;
    }
    const d = deals.find((x) => x.id === overId);
    return d?.status;
  }

  async function onDragEnd(event: DragEndEvent) {
    const dealId = event.active.id as string;
    const target = resolveStage(event.over?.id as string | undefined);
    setActiveId(null);
    setOverStage(null);
    if (!target || !PIPELINE_STAGES.includes(target)) return;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.status === target) return;

    if (!supabase) {
      router.refresh();
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("deals")
      .update({
        status: target,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dealId)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    await supabase.from("deal_activity").insert({
      deal_id: dealId,
      title: "Stage updated",
      note: `Moved from ${deal.status} to ${target}.`,
      user_id: user.id,
      activity_type: "stage_change",
    });

    router.refresh();
  }

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            Search
          </label>
          <Input
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="py-1">
            Sector
          </Badge>
          {SECTORS.map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={sectorFilter.includes(s) ? "secondary" : "outline"}
              onClick={() => toggleSector(s)}
            >
              {s}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Stage</span>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Min fit score</span>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any score</SelectItem>
                <SelectItem value="7">7+</SelectItem>
                <SelectItem value="8">8+</SelectItem>
                <SelectItem value="9">9+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 text-sm"
            onClick={() => {
              setSearch("");
              setSectorFilter([]);
              setStageFilter("all");
              setScoreFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        sensors={sensors}
        onDragStart={(e) => {
          setActiveId(e.active.id as string);
        }}
        onDragOver={(e) => {
          const stage = resolveStage(e.over?.id as string | undefined);
          setOverStage(stage ?? null);
        }}
        onDragEnd={onDragEnd}
      >
        <div className="overflow-x-auto pb-4">
          <div className="grid min-w-max grid-flow-col auto-cols-[minmax(260px,1fr)] gap-5 xl:min-w-0 xl:grid-flow-row xl:grid-cols-6">
            {PIPELINE_STAGES.map((stage) => {
              const stageDeals = filteredDeals.filter((d) => d.status === stage);

              return (
                <StageColumn
                  key={stage}
                  stage={stage}
                  isOver={overStage === stage}
                >
                  <CardHeader className="sticky top-0 z-10 rounded-t-xl border-b border-border/50 bg-card/95 backdrop-blur">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{stage}</CardTitle>
                      <span className="rounded-full border border-border/70 px-2 py-0.5 text-xs text-muted-foreground">
                        {stageDeals.length}
                      </span>
                    </div>
                    <CardDescription>
                      {stageDeals.length === 1 ? "1 deal" : `${stageDeals.length} deals`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {stageDeals.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
                        <p>No deals in {stage}</p>
                        <p className="mt-1">Upload a deck to start</p>
                        <Button
                          className="mt-4"
                          size="sm"
                          type="button"
                          onClick={onUploadDeck}
                        >
                          Upload Deck
                        </Button>
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <DraggableDealCard key={deal.id} deal={deal}>
                          <DealCardInner deal={deal} />
                        </DraggableDealCard>
                      ))
                    )}
                  </CardContent>
                </StageColumn>
              );
            })}
          </div>
        </div>
        <DragOverlay>
          {activeDeal ? (
            <div className="rounded-2xl border border-primary/40 bg-secondary/40 p-4 shadow-lg">
              <p className="font-medium">{activeDeal.company_name}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function DealCardInner({ deal }: { deal: Deal }) {
  const fit =
    deal.fit_score ??
    deal.analysis?.thesis_fit_score ??
    null;
  const risk =
    deal.analysis?.overall_risk_score ?? null;

  return (
    <Link href={`/deals/${deal.id}`}>
      <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary/40 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="line-clamp-1 font-medium">{deal.company_name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(deal.date_added)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <AgeBadge dateAdded={deal.date_added} stage={deal.status} />
            <Badge>{deal.sector}</Badge>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <ScoreBadge kind="fit" label="Fit" score={fit} />
          <ScoreBadge kind="risk" label="Risk" score={risk} />
        </div>
      </div>
    </Link>
  );
}
