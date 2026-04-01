// Shared implementation for chat completions APIs (standard format used by many providers).
// Used by openai, deepseek, and openrouter providers.

import { DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from "../types";
import type { LLMProvider, LLMProviderConfig, LLMProviderName, LLMRequest, LLMResponse } from "../types";
import { postJson } from "../utils";

type ChatCompletionsResponse = {
  choices: { message: { content: string } }[];
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
};

export function createChatCompletionsProvider(opts: {
  name: LLMProviderName;
  baseUrl: string;
  extraHeaders?: Record<string, string>;
}): LLMProvider {
  return {
    name: opts.name,

    async complete(request: LLMRequest, config: LLMProviderConfig): Promise<LLMResponse> {
      const { messages, system, maxTokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE } = request;

      const allMessages = system
        ? [{ role: "system" as const, content: system }, ...messages]
        : messages;

      const data = await postJson(
        `${config.baseUrl ?? opts.baseUrl}/chat/completions`,
        { Authorization: `Bearer ${config.apiKey}`, ...opts.extraHeaders },
        { model: config.model, messages: allMessages, max_tokens: maxTokens, temperature }
      ) as ChatCompletionsResponse;

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error(`${opts.name} returned an empty response`);

      return {
        content,
        model: data.model,
        provider: opts.name,
        inputTokens: data.usage?.prompt_tokens,
        outputTokens: data.usage?.completion_tokens,
      };
    },
  };
}
