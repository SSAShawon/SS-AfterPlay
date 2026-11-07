import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getAdminGames() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("games")
    .select("id,title,is_published")
    .order("title");
  return (data ?? []) as { id: string; title: string; is_published: boolean }[];
}

export async function getAdminJournalList() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_posts")
    .select("id,title,status")
    .order("title");
  return (data ?? []) as { id: string; title: string; status: string }[];
}
