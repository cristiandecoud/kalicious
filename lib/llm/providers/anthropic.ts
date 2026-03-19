import { DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from "../types";
import type { LLMProvider, LLMProviderConfig, LLMRequest, LLMResponse } from "../types";
import { postJson } from "../utils";

const BASE_URL = "https://api.anthropic.com";
const ANTHROPIC_VERSION = "2023-06-01";

export const anthropicProvider: LLMProvider = {
  name: "anthropic",

  async complete(request: LLMRequest, config: LLMProviderConfig): Promise<LLMResponse> {
    const { messages, system, maxTokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE } = request;

    const data = await postJson(
      `${config.baseUrl ?? BASE_URL}/v1/messages`,
      { "x-api-key": config.apiKey, "anthropic-version": ANTHROPIC_VERSION },
      {
        model: config.model,
        max_tokens: maxTokens,
        temperature,
        messages,
        ...(system ? { system } : {}),
      }
    ) as { content: { text: string }[]; model: string; usage?: { input_tokens: number; output_tokens: number } };

    const text = data.content?.[0]?.text;
    if (!text) throw new Error("Anthropic returned an empty response");

    return {
      content: text,
      model: data.model,
      provider: "anthropic",
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
    };
  },
};
