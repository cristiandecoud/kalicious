import { NextRequest, NextResponse } from "next/server";
import { getProvider, DEFAULT_MODELS } from "@/lib/llm/registry";
import type { LLMProviderName, LLMRequest } from "@/lib/llm/types";

const API_KEYS: Record<LLMProviderName, string | undefined> = {
  google: process.env.GOOGLE_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  openrouter: process.env.OPENROUTER_API_KEY,
  deepseek: process.env.DEEPSEEK_API_KEY,
};

const VALID_PROVIDERS = new Set<LLMProviderName>(["google", "anthropic", "openai", "openrouter", "deepseek"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { provider: providerName, request } = body as {
      provider: LLMProviderName;
      request: LLMRequest;
    };

    if (!providerName || !VALID_PROVIDERS.has(providerName)) {
      return NextResponse.json(
        { error: `Invalid provider. Valid options: ${[...VALID_PROVIDERS].join(", ")}` },
        { status: 400 }
      );
    }

    if (!request?.messages?.length) {
      return NextResponse.json({ error: "request.messages must be a non-empty array" }, { status: 400 });
    }

    const apiKey = API_KEYS[providerName];
    if (!apiKey) {
      return NextResponse.json(
        { error: `API key for "${providerName}" is not configured` },
        { status: 500 }
      );
    }

    const provider = getProvider(providerName);
    const response = await provider.complete(request, {
      apiKey,
      model: DEFAULT_MODELS[providerName],
    });

    return NextResponse.json(response);
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Unknown error";

    // Algunos SDKs (ej: Google) lanzan errores cuyo .message es un JSON crudo.
    // Intentamos extraer solo el campo "message" legible.
    let message = raw;
    try {
      const parsed = JSON.parse(raw);
      const inner = parsed?.error?.message ?? parsed?.message;
      if (typeof inner === "string") message = inner;
    } catch {
      // No era JSON — usamos el mensaje original
    }

    const status = message.includes("quota") || message.includes("RESOURCE_EXHAUSTED") ? 429 : 500;
    console.error("[/api/llm]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
