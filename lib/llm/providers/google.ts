import { GoogleGenAI } from "@google/genai";
import { DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from "../types";
import type { LLMProvider, LLMProviderConfig, LLMRequest, LLMResponse } from "../types";

export const googleProvider: LLMProvider = {
  name: "google",

  async complete(request: LLMRequest, config: LLMProviderConfig): Promise<LLMResponse> {
    const { messages, system, maxTokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE } = request;

    const ai = new GoogleGenAI({ apiKey: config.apiKey });

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const payload = {
      model: config.model,
      contents,
      config: {
        ...(system ? { systemInstruction: system } : {}),
        maxOutputTokens: maxTokens,
        temperature,
      },
    };
    console.log("[google] request →", JSON.stringify(payload, null, 2));

    const response = await ai.models.generateContent(payload);
    console.log("[google] response →", JSON.stringify(response, null, 2));

    const text = response.text;
    if (!text) throw new Error("Google returned an empty response");

    return {
      content: text,
      model: config.model,
      provider: "google",
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
    };
  },
};
