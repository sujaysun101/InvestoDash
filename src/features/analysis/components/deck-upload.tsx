"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { parseDeckFile } from "@/features/analysis/lib/deck-parser";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

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
      const parsedText = await parseDeckFile(file);
      onDeckParsed(parsedText);

      const supabase = createBrowserSupabaseClient();
      if (supabase) {
        const filePath = `${dealId}/${Date.now()}-${file.name}`;
        await supabase.storage.from("pitch-decks").upload(filePath, file, {
          upsert: true,
        });
      }

      toast.success(
        file.name.toLowerCase().endsWith(".pptx")
          ? "PPTX uploaded and text extracted."
          : "Deck uploaded and parsed.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not parse deck.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button asChild variant="outline">
        <label className="cursor-pointer">
          {uploading ? "Parsing deck..." : "Upload PDF or PPTX"}
          <input
            accept="application/pdf,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            className="hidden"
            onChange={handleFileChange}
            type="file"
          />
        </label>
      </Button>
      <p className="text-sm text-muted-foreground">
        PDFs use pdf.js; PPTX uses on-device text from slide XML before analysis.
      </p>
    </div>
  );
}
