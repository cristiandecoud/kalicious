import { createChatCompletionsProvider } from "./chat-completions";

export const openrouterProvider = createChatCompletionsProvider({
  name: "openrouter",
  baseUrl: "https://openrouter.ai/api/v1",
  extraHeaders: {
    "HTTP-Referer": "https://kalicious.app",
    "X-Title": "Kalicious",
  },
});
