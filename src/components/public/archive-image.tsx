"use client";

import * as React from "react";
import Image from "next/image";

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
 * Artwork is hosted externally (ImgBB / Steam CDN), so a URL can disappear.
 * This renders a quiet typographic placeholder instead of a broken image and
 * keeps layout stable because the container owns the aspect ratio.
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

  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-charcoal", className)}>
      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
          quality={82}
          onError={() => setFailed(true)}
          className={cn("object-cover", imgClassName)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#101216]">
          <span className="font-serif text-2xl leading-none text-silver/45">
            {(fallbackLabel ?? "SS").slice(0, 2).toUpperCase()}
          </span>
          <span className="h-px w-6 bg-line-strong" aria-hidden />
          <span className="text-[8px] font-medium uppercase tracking-[0.26em] text-muted">
            Afterplay
          </span>
        </div>
      )}
    </div>
  );
}
