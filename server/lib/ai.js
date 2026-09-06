import Anthropic from "@anthropic-ai/sdk";

// Anthropic Client (reads ANTHROPIC_API_KEY from env)
const client = new Anthropic();

// Default to Sonnet 5 — fast + cheap, ideal for a learning project.
// Override with AI_MODEL in server/.env (e.g. claude-opus-5 for deeper answers).
const MODEL = process.env.AI_MODEL || "claude-sonnet-5";

// Reserved username shown for AI-generated messages
export const AI_BOT_USERNAME = "AI Assistant";

// True only when an API key is configured. Routes use this to return a friendly
// "AI is off" message instead of a 500 error.
export function aiAvailable() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export const AI_MODEL_NAME = MODEL;

// ---------------------------------------------------------------------------
// Shared helper: one system + user prompt -> plain text answer
// ---------------------------------------------------------------------------
async function runClaude(system, user, maxTokens = 600) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text?.trim() || "";
}

// ---------------------------------------------------------------------------
// Feature 1 — short in-chat reply from the AI assistant (/ai or @ai)
// ---------------------------------------------------------------------------
export async function getAIReply(question) {
  const reply = await runClaude(
    "You are ConnectNext AI, a friendly and concise chat-room assistant. " +
      "Reply in 2-4 short sentences, like a helpful participant in a group chat. " +
      "Use plain text, no markdown headings.",
    question,
  );
  return reply || "Sorry, I couldn't come up with a reply.";
}

// ---------------------------------------------------------------------------
// Feature 2 — summarise a list of chat messages
// ---------------------------------------------------------------------------
export async function getConversationSummary(messages) {
  const transcript = messages
    .map((m) => `${m.username}: ${m.content}`)
    .join("\n");

  const summary = await runClaude(
    "You summarise group-chat conversations. Produce at most 5 short bullet points " +
      "covering key topics, decisions and action items. Start each line with '- '.",
    `Summarise this conversation:\n\n${transcript}`,
  );
  return summary || "Nothing to summarise yet.";
}

// ---------------------------------------------------------------------------
// Feature 3 — conversation starters for a room
// ---------------------------------------------------------------------------
export async function getIcebreakers(roomName, recentMessages) {
  const context = recentMessages.length
    ? `Recent messages:\n${recentMessages.map((m) => `${m.username}: ${m.content}`).join("\n")}`
    : "The room has no messages yet.";

  const text = await runClaude(
    "You help kick off group-chat conversations. Suggest exactly 3 short, fun, " +
      "open-ended questions the group could discuss. Return a plain numbered list, nothing else.",
    `Room name: "${roomName}"\n${context}`,
  );
  return text || "1. What's everyone working on today?";
}

// ---------------------------------------------------------------------------
// Feature 4 — polish a draft message
// ---------------------------------------------------------------------------
export async function getPolishedMessage(text) {
  const polished = await runClaude(
    "You are a writing assistant. Rewrite the user's chat message so it is clear, " +
      "friendly and well-phrased. Keep it roughly the same length and meaning. " +
      "Return ONLY the rewritten message, no quotes or commentary.",
    text,
    400,
  );
  return polished || text;
}

// ---------------------------------------------------------------------------
// Feature 5 (NEW in v4) — room "vibe check": mood + energy read
// ---------------------------------------------------------------------------
export async function getRoomVibe(roomName, messages) {
  if (!messages.length) {
    return { mood: "Quiet", emoji: "😴", energy: 1, note: "No messages yet — this room is waiting for its first hello." };
  }

  const transcript = messages
    .map((m) => `${m.username}: ${m.content}`)
    .join("\n");

  const raw = await runClaude(
    "You analyse the mood of a group chat. Respond with STRICT JSON only, no code fences, " +
      'shaped exactly: {"mood": string (one or two words), "emoji": string (single emoji), ' +
      '"energy": integer 1-5, "note": string (one friendly sentence, max 20 words)}.',
    `Room "${roomName}" recent messages:\n\n${transcript}`,
    300,
  );

  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return {
      mood: String(parsed.mood || "Neutral").slice(0, 30),
      emoji: String(parsed.emoji || "💬").slice(0, 4),
      energy: Math.min(5, Math.max(1, Number(parsed.energy) || 3)),
      note: String(parsed.note || "").slice(0, 160),
    };
  } catch {
    return { mood: "Neutral", emoji: "💬", energy: 3, note: raw.slice(0, 160) || "Could not read the room this time." };
  }
}

// ---------------------------------------------------------------------------
// Feature 6 (NEW in v4) — agentic AI Companion with tool use + memory
// ---------------------------------------------------------------------------
// `history` is the running conversation [{ role: "user"|"assistant", content }].
// `tools` is [{ name, description, input_schema }].
// `runTool(name, input)` executes a tool and returns a string result.
// Returns { reply, toolsUsed: string[] }.
export async function runCompanion(history, tools, runTool) {
  const system =
    "You are the ConnectNext Companion — a helpful, upbeat assistant living inside a " +
    "real-time chat app. You can look things up with the provided tools (rooms, messages, " +
    "the user's own stats) before answering. Keep answers friendly and reasonably short. " +
    "Use plain text with the occasional emoji. If a tool returns nothing useful, say so honestly.";

  const messages = history.slice(-12).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content || "").slice(0, 4000),
  }));

  const toolsUsed = [];

  for (let step = 0; step < 5; step++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 900,
      system,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      const textBlock = response.content.find((b) => b.type === "text");
      return { reply: textBlock?.text?.trim() || "…", toolsUsed };
    }

    const toolResults = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      toolsUsed.push(block.name);
      let result;
      try {
        result = await runTool(block.name, block.input || {});
      } catch (err) {
        result = `Tool error: ${err.message}`;
      }
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: String(result).slice(0, 6000),
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return { reply: "I looked into that but couldn't wrap it up — try asking again.", toolsUsed };
}
