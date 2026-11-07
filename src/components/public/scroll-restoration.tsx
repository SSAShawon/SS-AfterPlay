"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Always start a new page at the top, but respect in-page hash links. */
export function ScrollToTopOnRouteChange() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
