"use client";

import { useActionState } from "react";
import { Lock, Mail } from "lucide-react";

import { signInAction } from "@/lib/actions/auth";
import { IDLE_STATE } from "@/lib/action-state";
import { FormAlert, SubmitButton } from "@/components/admin/form-fields";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, formAction] = useActionState(signInAction, IDLE_STATE);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Administrator email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-silver/40" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue="samsul261103@gmail.com"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-silver/40" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="pl-9"
          />
        </div>
      </div>

      <FormAlert state={state} />

      <SubmitButton label="Sign in" pendingLabel="Verifying…" className="w-full" />
    </form>
  );
}
