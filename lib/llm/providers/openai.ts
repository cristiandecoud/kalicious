import { DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from "../types";
import type { LLMProvider, LLMProviderConfig, LLMRequest, LLMResponse } from "../types";
import { postJson } from "../utils";

const BASE_URL = "https://api.openai.com";

export const openaiProvider: LLMProvider = {
  name: "openai",

  async complete(request: LLMRequest, config: LLMProviderConfig): Promise<LLMResponse> {
    const { messages, system, maxTokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE } = request;

    const allMessages = system
      ? [{ role: "system" as const, content: system }, ...messages]
      : messages;

    const data = await postJson(
      `${config.baseUrl ?? BASE_URL}/v1/chat/completions`,
      { Authorization: `Bearer ${config.apiKey}` },
      { model: config.model, messages: allMessages, max_tokens: maxTokens, temperature }
    ) as { choices: { message: { content: string } }[]; model: string; usage?: { prompt_tokens: number; completion_tokens: number } };

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned an empty response");

    return {
      content,
      model: data.model,
      provider: "openai",
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens,
    };
  },
};
