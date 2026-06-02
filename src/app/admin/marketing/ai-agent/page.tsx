import { AIChatClient } from "./AIChatClient";

export const dynamic = "force-dynamic";

export default function AIAgentPage() {
  const hasApiKey = !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
  return <AIChatClient hasApiKey={hasApiKey} />;
}
