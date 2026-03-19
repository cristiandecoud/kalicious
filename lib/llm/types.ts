export type LLMProviderName = "anthropic" | "openai" | "google" | "openrouter" | "deepseek";

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  /** System prompt, passed separately to avoid mixing concerns with message history */
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: LLMProviderName;
  inputTokens?: number;
  outputTokens?: number;
}

export interface LLMProviderConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface LLMProvider {
  name: LLMProviderName;
  complete(request: LLMRequest, config: LLMProviderConfig): Promise<LLMResponse>;
}

export const DEFAULT_MAX_TOKENS = 1024;
export const DEFAULT_TEMPERATURE = 0.7;
