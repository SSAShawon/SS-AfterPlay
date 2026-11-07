import { cn } from "@/lib/utils";

/**
 * Structural wrapper only — the previous scroll-triggered animation layer was
 * removed so pages stay static, cheap to paint and instantly responsive.
 * The props are kept so existing page code keeps working.
 */
export function Reveal({
  children,
  className,
  delay: _delay,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li" | "figure";
}) {
  return <Tag className={cn(className)}>{children}</Tag>;
}
