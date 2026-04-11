"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { STAGES } from "@/lib/constants";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { ThesisProfile } from "@/lib/types";

const CHECK_SIZE_OPTIONS = [
  "$5k-$15k",
  "$10k-$25k",
  "$25k-$100k",
  "$100k-$250k",
  "$250k-$500k",
  "$500k-$1M",
  "$1M+",
];

export function ThesisOnboardingForm({
  sectors,
  initialThesis,
}: {
  sectors: string[];
  initialThesis?: ThesisProfile | null;
}) {
  const router = useRouter();
  const [selectedSectors, setSelectedSectors] = useState<string[]>(
    initialThesis?.sectors?.length ? initialThesis.sectors : [],
  );
  const [selectedStages, setSelectedStages] = useState<string[]>(
    initialThesis?.target_stage?.length ? initialThesis.target_stage : [],
  );
  const [checkSizeRange, setCheckSizeRange] = useState(
    initialThesis?.check_size_range ?? "$25k-$100k",
  );
  const [geographyPreference, setGeographyPreference] = useState(
    initialThesis?.geography_preference ?? "United States",
  );
  const [notes, setNotes] = useState(initialThesis?.custom_note ?? "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ sectors?: string; stages?: string }>({});

  function toggleValue(current: string[], value: string) {
    return current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
  }

  function validate() {
    const next: typeof errors = {};
    if (selectedSectors.length === 0) {
      next.sectors = "Select at least one sector.";
    }
    if (selectedStages.length === 0) {
      next.stages = "Select at least one target stage.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function saveProfile() {
    if (!validate()) return;

    setLoading(true);
    const payload = {
      sectors: selectedSectors,
      target_stage: selectedStages,
      check_size_range: checkSizeRange,
      geography_preference: geographyPreference,
      custom_note: notes,
    };

    const supabase = createBrowserSupabaseClient();

    try {
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("No authenticated user found.");
        }

        const { error } = await supabase.from("thesis").upsert(
          {
            user_id: user.id,
            ...payload,
          },
          { onConflict: "user_id" },
        );

        if (error) throw error;
      } else {
        window.localStorage.setItem("investodash:thesis", JSON.stringify(payload));
      }

      toast.success("Investment thesis saved.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save thesis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Field
        label="Preferred sectors"
        hint="Choose the verticals you actively invest in. Thesis-fit scoring weights sector match at 35%."
        error={errors.sectors}
      >
        <div className="flex flex-wrap gap-2">
          {sectors.map((sector) => (
            <Button
              key={sector}
              onClick={() => {
                setSelectedSectors((current) => toggleValue(current, sector));
                setErrors((e) => ({ ...e, sectors: undefined }));
              }}
              type="button"
              size="sm"
              variant={selectedSectors.includes(sector) ? "default" : "outline"}
            >
              {sector}
            </Button>
          ))}
        </div>
        {selectedSectors.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Selected: {selectedSectors.join(", ")}
          </p>
        )}
      </Field>

      <Field
        label="Target stage"
        hint="Which funding stages do you write checks at? Adjacent stages receive partial credit when scoring."
        error={errors.stages}
      >
        <div className="flex flex-wrap gap-2">
          {STAGES.map((stage) => (
            <Button
              key={stage}
              onClick={() => {
                setSelectedStages((current) => toggleValue(current, stage));
                setErrors((e) => ({ ...e, stages: undefined }));
              }}
              type="button"
              size="sm"
              variant={selectedStages.includes(stage) ? "default" : "outline"}
            >
              {stage}
            </Button>
          ))}
        </div>
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <Field
          label="Check size range"
          hint="Your typical ticket size. Used for stage fit and portfolio context."
        >
          <Select value={checkSizeRange} onValueChange={setCheckSizeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select check size" />
            </SelectTrigger>
            <SelectContent>
              {CHECK_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Geography preference"
          hint='Where you primarily invest. Use "Global" to skip geo filtering.'
        >
          <Input
            value={geographyPreference}
            onChange={(event) => setGeographyPreference(event.target.value)}
            placeholder="e.g. United States, Europe, Global"
          />
        </Field>
      </div>

      <Field
        label="Custom signals"
        hint="Founder archetypes, deal criteria, or signals you lean into. Keywords here are matched against AI analysis."
      >
        <Textarea
          placeholder="e.g. Prefer repeat founders with a prior exit. Deep interest in regulated industries. Network effects and defensible moats matter more than pure growth."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-[100px] resize-y"
        />
        {notes.trim().length > 0 && (
          <p className="text-xs text-muted-foreground">
            {notes.trim().split(/\s+/).length} words
          </p>
        )}
      </Field>

      {(selectedSectors.length > 0 || selectedStages.length > 0) && (
        <div className="rounded-xl border border-border/60 bg-secondary/10 px-4 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Thesis preview
          </p>
          <p className="text-sm text-foreground/80">
            Investing in{" "}
            <span className="font-medium text-foreground">
              {selectedSectors.length > 0 ? selectedSectors.join(", ") : "—"}
            </span>{" "}
            at{" "}
            <span className="font-medium text-foreground">
              {selectedStages.length > 0 ? selectedStages.join(" / ") : "—"} stage
            </span>
            {checkSizeRange ? (
              <>
                {" "}with{" "}
                <span className="font-medium text-foreground">{checkSizeRange}</span> checks
              </>
            ) : null}
            {geographyPreference ? (
              <>
                {" "}focused on{" "}
                <span className="font-medium text-foreground">{geographyPreference}</span>
              </>
            ) : null}.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={saveProfile} disabled={loading} className="min-w-[120px]">
          {loading ? "Saving..." : "Save thesis"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: Readonly<{
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
