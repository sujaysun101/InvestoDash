"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeckUpload } from "@/features/analysis/components/deck-upload";
import { RunAnalysisCard } from "@/features/analysis/components/run-analysis-button";
import { PIPELINE_STAGES } from "@/lib/constants";
import { Deal, ThesisProfile } from "@/lib/types";

export function DealRoom({
  deal,
  thesis,
}: {
  deal: Deal;
  thesis: ThesisProfile | null;
}) {
  const [notes, setNotes] = useState(deal.notes_html);
  const [status, setStatus] = useState(deal.status);
  const [parsedDeckText, setParsedDeckText] = useState("");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Button asChild className="w-fit" variant="ghost">
            <Link href="/">
              <ArrowLeft />
              Back to pipeline
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-tight">
                {deal.company_name}
              </h1>
              <Badge>{deal.sector}</Badge>
              <Badge variant="outline">{status}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {deal.stage} · Added {deal.date_added}
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <a href={deal.website_url} rel="noreferrer" target="_blank">
            <Globe />
            Visit website
          </a>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Deal room</CardTitle>
              <CardDescription>
                Keep canonical company data, notes, status, and activity in one
                place.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Company name">
                  <Input defaultValue={deal.company_name} />
                </Field>
                <Field label="Website URL">
                  <Input defaultValue={deal.website_url} />
                </Field>
                <Field label="Stage">
                  <Input defaultValue={deal.stage} />
                </Field>
                <Field label="Sector">
                  <Input defaultValue={deal.sector} />
                </Field>
              </div>

              <Field label="Pipeline status">
                <div className="flex flex-wrap gap-3">
                  {PIPELINE_STAGES.map((stage) => (
                    <Button
                      key={stage}
                      onClick={() => setStatus(stage)}
                      type="button"
                      variant={status === stage ? "secondary" : "outline"}
                    >
                      {stage}
                    </Button>
                  ))}
                </div>
              </Field>

              <Field label="Notes">
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deck upload</CardTitle>
              <CardDescription>
                Pitch decks are stored in Supabase Storage and parsed client-side.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <DeckUpload dealId={deal.id} onDeckParsed={setParsedDeckText} />
              {parsedDeckText ? (
                <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4 text-sm text-muted-foreground">
                  {parsedDeckText.slice(0, 320)}...
                </div>
              ) : null}
            </CardContent>
          </Card>

          <RunAnalysisCard
            deal={deal}
            initialAnalysis={deal.analysis}
            parsedDeckText={parsedDeckText}
            thesis={thesis}
            usageRemaining={deal.usage_remaining}
          />
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity log</CardTitle>
              <CardDescription>
                Timeline of diligence notes and pipeline changes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {deal.activity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/60 bg-secondary/30 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.timestamp}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.note}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment thesis alignment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
              {thesis ? (
                <>
                  <p>Sectors: {thesis.sectors.join(", ")}</p>
                  <p>Stages: {thesis.target_stage.join(", ")}</p>
                  <p>Check size: {thesis.check_size_range}</p>
                  <p>Geo: {thesis.geography_preference}</p>
                  {thesis.custom_note ? <p>Note: {thesis.custom_note}</p> : null}
                </>
              ) : (
                <p>Complete the onboarding flow to unlock thesis-fit scoring.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: Readonly<{
  label: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}
