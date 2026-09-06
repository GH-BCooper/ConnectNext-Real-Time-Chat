import Anthropic from "@anthropic-ai/sdk";

// Anthropic Client (reads ANTHROPIC_API_KEY from env)
const client = new Anthropic();

const MODEL = process.env.AI_MODEL || "claude-opus-5";

// Reserved username shown for AI-generated messages
export const AI_BOT_USERNAME = "AI Assistant";

// Shared helper: send one system + user prompt to Claude and return the text
async function runClaude(system, user, maxTokens = 512) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    output_config: { effort: "low" },
    system,
    messages: [{ role: "user", content: user }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text?.trim() || "";
}

// Generate a short chat reply from the AI assistant
export async function getAIReply(question) {
  const reply = await runClaude(
    "You are a friendly, concise chat room assistant called ConnectNext AI. Keep replies short (2-4 sentences) and conversational, like a helpful participant in a group chat.",
    question,
  );
  return reply || "Sorry, I couldn't come up with a reply.";
}

// Summarize a list of chat messages into a short digest
export async function getConversationSummary(messages) {
  const transcript = messages
    .map((m) => `${m.username}: ${m.content}`)
    .join("\n");

  const summary = await runClaude(
    "You summarize group chat conversations. Produce a short summary (max 5 bullet points) covering the key topics and any decisions or action items. Be concise.",
    `Summarize this conversation:\n\n${transcript}`,
  );
  return summary || "Nothing to summarize yet.";
}

// Suggest a few conversation starters for a room
export async function getIcebreakers(roomName, recentMessages) {
  const context = recentMessages.length
    ? `Recent messages:\n${recentMessages.map((m) => `${m.username}: ${m.content}`).join("\n")}`
    : "The room has no messages yet.";

  const text = await runClaude(
    "You help kick off group chat conversations. Given a room and its recent activity, suggest exactly 3 short, fun, open-ended questions the group could discuss. Return them as a plain numbered list, nothing else.",
    `Room name: "${roomName}"\n${context}`,
  );
  return text || "1. What's everyone working on today?";
}

// Rewrite a draft message so it's clearer and friendlier
export async function getPolishedMessage(text) {
  const polished = await runClaude(
    "You are a writing assistant. Rewrite the user's chat message so it is clear, friendly and well-phrased. Keep it roughly the same length and meaning. Return ONLY the rewritten message with no quotes or commentary.",
    text,
  );
  return polished || text;
}
