import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "samsul261103@gmail.com").toLowerCase();

/**
 * Returns the signed-in user only when they match the single authorised
 * administrator. Every admin page and every server action calls this.
 */
export async function getAdminUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return null;
    if (user.email.toLowerCase() !== ADMIN_EMAIL) return null;
    if (!user.email_confirmed_at) return null;

    return user;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function assertAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) {
    throw new Error("Unauthorised: administrator session required.");
  }
  return user;
}
