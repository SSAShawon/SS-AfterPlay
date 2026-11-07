"use server";

import { searchArchive } from "@/lib/queries/search";
import type { SearchResultGroup } from "@/lib/types";

export async function searchAction(term: string): Promise<SearchResultGroup> {
  return searchArchive(term);
}
