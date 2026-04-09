"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DealBoard } from "@/features/deals/components/deal-board";
import { SECTORS, STAGES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { Deal } from "@/lib/types";

export function DashboardClient({
  deals,
  usage,
}: {
  deals: Deal[];
  usage: { used: number; limit: number; remaining: number };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState<(typeof SECTORS)[number]>(SECTORS[0]);
  const [stage, setStage] = useState<(typeof STAGES)[number]>(STAGES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAnalyze = usage.remaining > 0;

  async function handleAnalyzeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canAnalyze) {
      setShowUpgrade(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      if (!file) {
        throw new Error("Please attach a pitch deck PDF.");
      }

      const { data: inserted, error: insertError } = await supabase
        .from("deals")
        .insert({
          user_id: user.id,
          company_name: companyName.trim(),
          founder_name: "",
          website_url: "",
          sector,
          stage,
          status: "Inbox",
          date_added: new Date().toISOString().slice(0, 10),
          notes_html: "",
          analysis_status: "pending",
        })
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }

      const dealId = inserted?.id as string;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("deal_id", dealId);
      formData.append("company_name", companyName.trim());
      formData.append("sector", sector);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Analysis failed");
      }

      setFile(null);
      setCompanyName("");
      setSector(SECTORS[0]);
      setStage(STAGES[0]);
      setIsModalOpen(false);
      router.refresh();
      toast.success("Deal created and analysis started.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create deal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="mb-8 rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-background to-background p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80">
              Deal pipeline
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Move from first look to decision faster.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Track every active opportunity, compare conviction and risk signals, and
              keep your pipeline organized by stage.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
              <p className="text-muted-foreground">Active deals</p>
              <p className="text-xl font-semibold">{deals.length}</p>
            </div>
            <Button className="h-11 px-5" onClick={() => setIsModalOpen(true)}>
              Upload Deck
            </Button>
          </div>
        </div>
      </section>

      <DealBoard deals={deals} onUploadDeck={() => setIsModalOpen(true)} />

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-border/80 shadow-2xl">
            <CardHeader>
              <CardTitle>Upload Deck</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add a new deal to your pipeline and run AI analysis.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleAnalyzeSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Pitch Deck File (.pdf, .pptx)
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.pptx"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    required
                  />
                  {file ? (
                    <p className="text-xs text-muted-foreground">Selected: {file.name}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sector</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={sector}
                    onChange={(event) =>
                      setSector(event.target.value as (typeof SECTORS)[number])
                    }
                  >
                    {SECTORS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Stage</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={stage}
                    onChange={(event) =>
                      setStage(event.target.value as (typeof STAGES)[number])
                    }
                  >
                    {STAGES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="min-w-24"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !canAnalyze}
                    className="min-w-24"
                    onClick={(e) => {
                      if (!canAnalyze) {
                        e.preventDefault();
                        setShowUpgrade(true);
                      }
                    }}
                  >
                    {isSubmitting
                      ? "Analyzing..."
                      : canAnalyze
                        ? "Analyze"
                        : "Upgrade to analyze"}
                  </Button>
                </div>
                {!canAnalyze ? (
                  <p className="text-sm text-muted-foreground">
                    You&apos;ve used all 3 free analyses. Upgrade to continue.
                  </p>
                ) : null}
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {showUpgrade ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-primary/30">
            <CardHeader>
              <CardTitle>Unlock unlimited analyses</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pro Plan — $29/month
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                <li>Unlimited AI deck analysis</li>
                <li>Full diligence reports</li>
                <li>Priority support</li>
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a href="/pricing">Start Free Trial</a>
                </Button>
                <Button variant="outline" type="button" onClick={() => setShowUpgrade(false)}>
                  Maybe later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
