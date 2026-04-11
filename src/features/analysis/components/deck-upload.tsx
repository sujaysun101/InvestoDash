"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { parseDeckFileClient } from "@/features/analysis/lib/deck-parser";
import { PITCH_FILE_ACCEPT } from "@/lib/constants";
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
      const parsedText = await parseDeckFileClient(file);
      onDeckParsed(parsedText);

      const supabase = createBrowserSupabaseClient();
      if (supabase) {
        const filePath = `${dealId}/${Date.now()}-${file.name}`;
        await supabase.storage.from("pitch-decks").upload(filePath, file, {
          upsert: true,
        });
      }

      toast.success("Deck uploaded and parsed.");
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
          {uploading ? "Parsing deck..." : "Upload deck file"}
          <input
            accept={PITCH_FILE_ACCEPT}
            className="hidden"
            onChange={handleFileChange}
            type="file"
          />
        </label>
      </Button>
      <p className="text-sm text-muted-foreground">
        PDF and text run in the browser; Office, images, and video go through the
        server when you analyze a deal.
      </p>
    </div>
  );
}
