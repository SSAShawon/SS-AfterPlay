import "server-only";

export async function safeQuery<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn(
      `[ss-afterplay] data fetch failed (${label}):`,
      error instanceof Error ? error.message : error,
    );
    return fallback;
  }
}

export function unwrap<T>(result: { data: T | null; error: { message: string } | null }, label: string): T {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return (result.data ?? []) as T;
}
