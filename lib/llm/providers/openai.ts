import { createChatCompletionsProvider } from "./chat-completions";

export const openaiProvider = createChatCompletionsProvider({
  name: "openai",
  baseUrl: "https://api.openai.com/v1",
});
