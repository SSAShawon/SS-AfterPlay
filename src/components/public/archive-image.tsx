"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ArchiveImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackLabel?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Artwork is hosted externally (ImgBB direct URLs), so a URL can disappear.
 * This renders a controlled placeholder instead of a broken image, and never
 * shifts layout because the container owns the aspect ratio.
 */
export function ArchiveImage({
  src,
  alt,
  className,
  imgClassName,
  fallbackLabel,
  priority = false,
  sizes,
}: ArchiveImageProps) {
  const [failed, setFailed] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-charcoal", className)}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          className={cn(
            "size-full object-cover transition-all duration-700",
            loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm",
            imgClassName,
          )}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[linear-gradient(150deg,#14161B,#0b0c10)]">
          <div
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(244,244,245,0.10) 0px, rgba(244,244,245,0.10) 1px, transparent 1px, transparent 12px)",
            }}
          />
          <span className="relative font-serif text-2xl text-silver/50">
            {fallbackLabel?.slice(0, 2).toUpperCase() ?? "SS"}
          </span>
          <span className="relative max-w-[80%] text-center font-mono text-[8px] uppercase tracking-[0.24em] text-silver/30">
            SS · Afterplay
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/60 via-transparent to-transparent opacity-60" />
    </div>
  );
}
