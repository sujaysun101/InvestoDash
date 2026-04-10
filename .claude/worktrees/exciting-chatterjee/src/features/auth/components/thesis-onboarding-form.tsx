"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const stages = ["Pre-Seed", "Seed", "Series A"];

export function ThesisOnboardingForm({ sectors }: { sectors: string[] }) {
  const router = useRouter();
  const [selectedSectors, setSelectedSectors] = useState<string[]>(["Fintech"]);
  const [selectedStages, setSelectedStages] = useState<string[]>(["Seed"]);
  const [checkSizeRange, setCheckSizeRange] = useState("$25k-$100k");
  const [geographyPreference, setGeographyPreference] = useState("United States");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleValue(current: string[], value: string) {
    return current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
  }

  async function saveProfile() {
    setLoading(true);

    try {
      const res = await fetch("/api/thesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectors: selectedSectors,
          target_stage: selectedStages,
          check_size_range: checkSizeRange,
          geography_preference: geographyPreference,
          custom_note: notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not save thesis.");
      }

      toast.success("Investment thesis saved.");
      router.push("/compare");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save thesis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Field label="Preferred sectors">
        <div className="flex flex-wrap gap-3">
          {sectors.map((sector) => (
            <Button
              key={sector}
              onClick={() => setSelectedSectors((current) => toggleValue(current, sector))}
              type="button"
              variant={selectedSectors.includes(sector) ? "secondary" : "outline"}
            >
              {sector}
            </Button>
          ))}
        </div>
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Check size range">
          <Input value={checkSizeRange} onChange={(e) => setCheckSizeRange(e.target.value)} />
        </Field>
        <Field label="Geography preference">
          <Input value={geographyPreference} onChange={(e) => setGeographyPreference(e.target.value)} />
        </Field>
      </div>

      <Field label="Target stage">
        <div className="flex flex-wrap gap-3">
          {stages.map((stage) => (
            <Button
              key={stage}
              onClick={() => setSelectedStages((current) => toggleValue(current, stage))}
              type="button"
              variant={selectedStages.includes(stage) ? "secondary" : "outline"}
            >
              {stage}
            </Button>
          ))}
        </div>
      </Field>

      <Field label="Custom note">
        <Textarea
          placeholder="Founder archetypes, edge cases, or sectors you want to lean into."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>

      <div className="flex justify-end">
        <Button onClick={saveProfile}>{loading ? "Saving..." : "Save thesis"}</Button>
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
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}
