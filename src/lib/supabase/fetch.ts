/**
 * Every Supabase request goes through this fetch wrapper.
 *
 * Without it, a stalled upstream (dropped packets, a dead proxy, a slow region)
 * leaves the socket open until the client gives up on its own — in practice tens
 * of seconds of a blank page. Public queries already tolerate failure via
 * safeQuery, so aborting early simply degrades to an empty state instead of
 * hanging the render.
 *
 * Production keeps a generous ceiling (a cold project can take a moment); local
 * development and sandbox previews get a tight one, because an unreachable
 * project should not cost the render several seconds per query.
 */
const DEFAULT_TIMEOUT_MS = process.env.NODE_ENV === "development" ? 1200 : 8000;

function combineSignals(timeoutSignal: AbortSignal, external?: AbortSignal | null) {
  if (!external) return timeoutSignal;

  // AbortSignal.any is available in Node 20.3+ and every current browser.
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([external, timeoutSignal]);
  }

  // Fallback: honour whichever signal fires first.
  const controller = new AbortController();
  const forward = (signal: AbortSignal) => () => controller.abort(signal.reason);
  external.addEventListener("abort", forward(external), { once: true });
  timeoutSignal.addEventListener("abort", forward(timeoutSignal), { once: true });
  return controller.signal;
}

export function fetchWithTimeout(timeoutMs: number = DEFAULT_TIMEOUT_MS) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error("Supabase request timed out")), timeoutMs);

    try {
      return await fetch(input, { ...init, signal: combineSignals(controller.signal, init?.signal) });
    } finally {
      clearTimeout(timer);
    }
  };
}

/**
 * PostgREST retries transient network errors with exponential backoff. In
 * production that masks a blip; in a preview or local run where the project is
 * simply unreachable it only multiplies the wait, so it is limited to
 * production builds.
 */
export const dbOptions = { retry: process.env.NODE_ENV === "production" };

/** Server-side reads are never cached; the wrapper keeps that guarantee. */
export const supabaseFetch = fetchWithTimeout();

export function noStoreFetch(input: RequestInfo | URL, init?: RequestInit) {
  return supabaseFetch(input, { ...init, cache: "no-store" });
}
