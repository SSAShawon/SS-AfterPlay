import { cn } from "@/lib/utils";

interface FlagToggleProps {
  action: (formData: FormData) => Promise<void>;
  id: string;
  field: string;
  value: boolean;
  labelOn: string;
  labelOff: string;
  className?: string;
  extraFields?: Record<string, string>;
}

/** Small inline form that flips a boolean flag through a server action. */
export function FlagToggle({
  action,
  id,
  field,
  value,
  labelOn,
  labelOff,
  className,
  extraFields,
}: FlagToggleProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="next" value={value ? "false" : "true"} />
      {extraFields &&
        Object.entries(extraFields).map(([key, val]) => (
          <input key={key} type="hidden" name={key} value={val} />
        ))}
      <button
        type="submit"
        className={cn(
          "inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.14em] transition-colors",
          value
            ? "border-[#4fa87a]/40 bg-[#4fa87a]/[0.07] text-[#7cc9a1] hover:border-[#4fa87a]/70"
            : "border-line-strong text-silver/50 hover:border-white/30 hover:text-soft",
          className,
        )}
      >
        {value ? labelOn : labelOff}
      </button>
    </form>
  );
}
