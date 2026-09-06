import Anthropic from "@anthropic-ai/sdk";

// Anthropic Client (reads ANTHROPIC_API_KEY from env)
const client = new Anthropic();

const MODEL = process.env.AI_MODEL || "claude-opus-5";

// Reserved username shown for AI-generated messages
export const AI_BOT_USERNAME = "AI Assistant";

// Generate a short chat reply from the AI assistant
export async function getAIReply(question) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    output_config: { effort: "low" },
    system:
      "You are a friendly, concise chat room assistant called ConnectNext AI. Keep replies short (2-4 sentences) and conversational, like a helpful participant in a group chat.",
    messages: [{ role: "user", content: question }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text?.trim() || "Sorry, I couldn't come up with a reply.";
}

// Summarize a list of chat messages into a short digest
export async function getConversationSummary(messages) {
  const transcript = messages
    .map((m) => `${m.username}: ${m.content}`)
    .join("\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    output_config: { effort: "low" },
    system:
      "You summarize group chat conversations. Produce a short summary (max 5 bullet points) covering the key topics and any decisions or action items. Be concise.",
    messages: [
      {
        role: "user",
        content: `Summarize this conversation:\n\n${transcript}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text?.trim() || "Nothing to summarize yet.";
}
