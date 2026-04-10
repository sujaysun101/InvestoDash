import { createClient } from "@/lib/supabase/client";

export function createBrowserSupabaseClient() {
  return createClient();
}
