"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDeleteProps {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
  title: string;
  description: string;
  extraFields?: Record<string, string>;
  variant?: "icon" | "text";
}

export function ConfirmDelete({
  action,
  id,
  label = "Delete",
  title,
  description,
  extraFields,
  variant = "text",
}: ConfirmDeleteProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {variant === "icon" ? (
          <button
            type="button"
            aria-label={label}
            className="flex size-8 items-center justify-center border border-white/12 text-silver/60 transition-colors hover:border-blood/50 hover:text-blood"
          >
            <Trash2 className="size-3.5" />
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-silver/50 transition-colors hover:text-blood"
          >
            <Trash2 className="size-3" /> {label}
          </button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <div className="flex items-start gap-3">
          <span className="mt-1 flex size-8 shrink-0 items-center justify-center border border-blood/40 text-blood">
            <Trash2 className="size-4" />
          </span>
          <div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </div>
        </div>

        <form action={action} className="mt-7 flex items-center justify-end gap-3">
          <input type="hidden" name="id" value={id} />
          {extraFields &&
            Object.entries(extraFields).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <button type="submit" className={cn(buttonVariants({ variant: "danger" }))}>
            Delete permanently
          </button>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
