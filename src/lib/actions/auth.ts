"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ADMIN_EMAIL, assertAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { errorMessage } from "@/lib/actions/helpers";

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return errorState("Email and password are required.");
  if (email !== ADMIN_EMAIL) {
    return errorState("These credentials do not match the archive administrator.");
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return errorState(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : error.message,
      );
    }
  } catch (error) {
    return errorState(errorMessage(error));
  }

  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore — the cookie will expire regardless
  }
  redirect("/admin/login");
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  try {
    await assertAdmin();

    if (password.length < 10) {
      return errorState("Choose a password of at least 10 characters.");
    }
    if (password !== confirm) {
      return errorState("The two passwords do not match.");
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return errorState(error.message);

    revalidatePath("/admin/settings");
    return successState("Password updated. Use it the next time you sign in.");
  } catch (error) {
    return errorState(errorMessage(error));
  }
}
