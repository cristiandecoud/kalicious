import type { LLMProviderName } from "./types";

/**
 * POSTs JSON to a URL, throws a descriptive error on non-OK responses.
 */
export async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown
): Promise<unknown> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}

export function providerError(provider: LLMProviderName, status: number, body: string): Error {
  return new Error(`${provider} error ${status}: ${body}`);
}
