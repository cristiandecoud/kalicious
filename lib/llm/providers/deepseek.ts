import { createChatCompletionsProvider } from "./chat-completions";

export const deepseekProvider = createChatCompletionsProvider({
  name: "deepseek",
  baseUrl: "https://api.deepseek.com",
});
