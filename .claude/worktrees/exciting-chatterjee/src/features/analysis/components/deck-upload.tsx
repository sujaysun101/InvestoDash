"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { parseDeckPdf } from "@/features/analysis/lib/deck-parser";

export function DeckUpload({
  dealId,
  onDeckParsed,
}: {
  dealId: string;
  onDeckParsed: (text: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const parsedText = await parseDeckPdf(file);
      onDeckParsed(parsedText);

      // Upload to Supabase storage if configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const { createBrowserClient } = await import("@supabase/ssr");
        const supabase = createBrowserClient(supabaseUrl, supabaseKey);
        const filePath = `${dealId}/${Date.now()}-${file.name}`;
        await supabase.storage.from("pitch-decks").upload(filePath, file, { upsert: true });
      }

      toast.success("Deck uploaded and parsed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not parse deck.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button asChild variant="outline">
        <label className="cursor-pointer">
          {uploading ? "Parsing deck..." : "Upload PDF deck"}
          <input
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
            type="file"
          />
        </label>
      </Button>
      <p className="text-sm text-muted-foreground">
        PDF extraction runs client-side with pdf.js before analysis.
      </p>
    </div>
  );
}
