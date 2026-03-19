import type { LLMProviderName, LLMRequest, LLMResponse } from "./types";

/**
 * Client-side service for communicating with LLMs via the /api/llm proxy.
 * API keys never leave the server.
 */
export async function callLLM(
  provider: LLMProviderName,
  request: LLMRequest
): Promise<LLMResponse> {
  const res = await fetch("/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, request }),
  });

  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));

  if (!res.ok) {
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }

  return data as LLMResponse;
}

/**
 * Convenience wrapper: sends a single user message with an optional system prompt.
 */
export async function askLLM(
  provider: LLMProviderName,
  userMessage: string,
  options?: Pick<LLMRequest, "system" | "maxTokens" | "temperature">
): Promise<string> {
  const response = await callLLM(provider, {
    messages: [{ role: "user", content: userMessage }],
    ...options,
  });
  return response.content;
}
