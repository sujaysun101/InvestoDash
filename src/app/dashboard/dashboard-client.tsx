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
import { PITCH_FILE_ACCEPT, SECTORS, STAGES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { Deal } from "@/lib/types";

export function DashboardClient({ deals }: { deals: Deal[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [founderName, setFounderName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sector, setSector] = useState<(typeof SECTORS)[number]>(SECTORS[0]);
  const [stage, setStage] = useState<(typeof STAGES)[number]>(STAGES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setFile(null);
    setCompanyName("");
    setFounderName("");
    setWebsiteUrl("");
    setSector(SECTORS[0]);
    setStage(STAGES[0]);
  }

  async function handleAnalyzeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        throw new Error("Please attach a pitch deck.");
      }

      const { data: inserted, error: insertError } = await supabase
        .from("deals")
        .insert({
          user_id: user.id,
          company_name: companyName.trim(),
          founder_name: founderName.trim(),
          website_url: websiteUrl.trim(),
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

      resetForm();
      setIsModalOpen(false);
      router.refresh();
      toast.success("Deal created — AI analysis running.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create deal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const analyzedCount = deals.filter((d) => d.analysis !== null).length;

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
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
              <p className="text-muted-foreground">Analyzed</p>
              <p className="text-xl font-semibold">{analyzedCount}</p>
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
              <form className="space-y-4" onSubmit={handleAnalyzeSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Pitch deck or materials <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="file"
                    accept={PITCH_FILE_ACCEPT}
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    required
                  />
                  {file ? (
                    <p className="text-xs text-muted-foreground">Selected: {file.name}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Company Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="e.g. NovaPay AI"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Founder Name</label>
                    <Input
                      value={founderName}
                      onChange={(event) => setFounderName(event.target.value)}
                      placeholder="e.g. Jane Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      value={websiteUrl}
                      onChange={(event) => setWebsiteUrl(event.target.value)}
                      placeholder="https://..."
                      type="url"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsModalOpen(false);
                    }}
                    className="min-w-24"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="min-w-28">
                    {isSubmitting ? "Adding..." : "Add deal"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
