"use client";

import { useActionState } from "react";

import { changePasswordAction } from "@/lib/actions/auth";
import { IDLE_STATE } from "@/lib/action-state";
import { FormAlert, SubmitButton, TextField } from "@/components/admin/form-fields";

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, IDLE_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          name="password"
          label="New password"
          type="password"
          required
          hint="At least 10 characters."
          className="md:col-span-2"
        />
        <TextField
          name="confirm"
          label="Confirm new password"
          type="password"
          required
          className="md:col-span-2"
        />
      </div>

      <FormAlert state={state} />

      <SubmitButton label="Update password" />
    </form>
  );
}
