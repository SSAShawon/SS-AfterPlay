#!/usr/bin/env node
/**
 * Creates (or repairs) the single administrator account for SS AFTERPLAY.
 *
 *   npm run create-admin -- --email samsul261103@gmail.com --password "…"
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local. The key is read from the
 * environment only and never printed. This script is the *only* place the
 * service role key is used; the app itself never imports it.
 */
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  for (const rawLine of readFileSync(".env.local", "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = "true";
    }
  }
  return args;
}

async function main() {
  loadEnvLocal();

  const args = parseArgs(process.argv.slice(2));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = (args.email ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = args.password ?? "";

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
        "Add them to .env.local (see .env.example) and re-run.",
    );
    process.exit(1);
  }
  if (!email || !email.includes("@")) {
    console.error("Pass the administrator email: npm run create-admin -- --email you@example.com --password '…'");
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("Choose a password of at least 10 characters.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Find an existing auth user for this email (paginate; tiny project).
  let existing = null;
  for (let page = 1; page <= 20 && !existing; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.error(`Could not list users: ${error.message}`);
      process.exit(1);
    }
    existing = data.users.find((user) => user.email?.toLowerCase() === email) ?? null;
    if (data.users.length < 200) break;
  }

  let userId;
  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) {
      console.error(`Could not update the existing user: ${error.message}`);
      process.exit(1);
    }
    userId = existing.id;
    console.log(`✔ Updated password for existing account ${email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      console.error(`Could not create the account: ${error?.message ?? "unknown error"}`);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`✔ Created administrator account ${email}`);
  }

  // 2. Register the user in public.admins — this is what RLS is_admin() checks.
  const { error: adminError } = await supabase
    .from("admins")
    .upsert({ user_id: userId, email }, { onConflict: "user_id" });

  if (adminError) {
    console.error(`Account exists but the admins row failed: ${adminError.message}`);
    process.exit(1);
  }

  console.log("✔ Registered in public.admins — /admin/login is ready.");
  console.log("  Sign-up is disabled, so this is the only way to create an account.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
