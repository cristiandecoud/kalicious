import { anthropicProvider } from "./providers/anthropic";
import { deepseekProvider } from "./providers/deepseek";
import { googleProvider } from "./providers/google";
import { openaiProvider } from "./providers/openai";
import { openrouterProvider } from "./providers/openrouter";
import type { LLMProvider, LLMProviderName } from "./types";

const providers: Record<LLMProviderName, LLMProvider> = {
  google: googleProvider,
  anthropic: anthropicProvider,
  openai: openaiProvider,
  openrouter: openrouterProvider,
  deepseek: deepseekProvider,
};

export function getProvider(name: LLMProviderName): LLMProvider {
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown LLM provider: ${name}`);
  return provider;
}

export const DEFAULT_MODELS: Record<LLMProviderName, string> = {
  google: "gemini-2.0-flash-lite-001",
  anthropic: "claude-sonnet-4-6",
  openai: "gpt-4o",
  openrouter: "meta-llama/llama-3.3-70b-instruct:free",
  deepseek: "deepseek-chat",
};

export const DEFAULT_PROVIDER: LLMProviderName = "deepseek";
