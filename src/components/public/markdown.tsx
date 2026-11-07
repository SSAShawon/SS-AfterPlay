import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

export function Markdown({
  content,
  className,
  variant = "prose",
}: {
  content: string | null | undefined;
  className?: string;
  variant?: "prose" | "plain";
}) {
  if (!content) return null;

  return (
    <div
      className={cn(
        variant === "prose" ? "prose prose-archive" : "space-y-4 text-sm leading-relaxed text-silver",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer noopener" : undefined}
              {...props}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
