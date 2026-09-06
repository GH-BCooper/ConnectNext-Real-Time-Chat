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
// Feature 1 — short in-room reply from the AI tutor (/ai or @ai)
// ---------------------------------------------------------------------------
export async function getAIReply(question) {
  const reply = await runClaude(
    "You are the ConnectNext AI tutor, sitting inside a real-time study room. " +
      "Answer the group's question clearly and accurately in 2-4 short sentences, " +
      "the way a good study partner would. Plain text, no markdown headings.",
    question,
  );
  return reply || "Sorry, I couldn't come up with a reply.";
}

// ---------------------------------------------------------------------------
// Feature 2 — turn a study session into structured revision notes
// ---------------------------------------------------------------------------
export async function getConversationSummary(messages) {
  const transcript = messages
    .map((m) => `${m.username}: ${m.content}`)
    .join("\n");

  const summary = await runClaude(
    "You turn a group study session into revision notes. Produce at most 6 concise " +
      "bullet points capturing the key concepts, definitions and takeaways worth " +
      "remembering. Start each line with '- '. Skip small talk.",
    `Study session transcript:\n\n${transcript}`,
  );
  return summary || "Not enough studying yet to make notes.";
}

// ---------------------------------------------------------------------------
// Feature 3 — discussion prompts to push the study session forward
// ---------------------------------------------------------------------------
export async function getIcebreakers(roomName, recentMessages) {
  const context = recentMessages.length
    ? `Recent messages:\n${recentMessages.map((m) => `${m.username}: ${m.content}`).join("\n")}`
    : "The room has no messages yet.";

  const text = await runClaude(
    "You help a study group go deeper. Suggest exactly 3 short, open-ended questions " +
      "that would test understanding or open up the topic further. If the room is empty, " +
      "base them on the room's subject. Return a plain numbered list, nothing else.",
    `Study room: "${roomName}"\n${context}`,
  );
  return text || "1. What's the core idea here, in one sentence?";
}

// ---------------------------------------------------------------------------
// Feature 3b (NEW in v5) — generate a quick recall quiz from the session
// Returns { questions: [{ q, options[4], correct 0-3, why }] } (may be empty).
// ---------------------------------------------------------------------------
export async function getQuiz(roomName, messages) {
  const studyText = messages
    .map((m) => `${m.username}: ${m.content}`)
    .join("\n");

  if (studyText.trim().length < 80) {
    return { questions: [], note: "Study a bit more first — there isn't enough here to quiz on yet." };
  }

  const raw = await runClaude(
    "You write short recall quizzes from a study session. Respond with STRICT JSON only, " +
      "no code fences, shaped exactly: " +
      '{"questions": [{"q": string, "options": [string, string, string, string], ' +
      '"correct": integer 0-3, "why": string (one sentence)}]}. ' +
      "Write 3 to 5 questions, each testing a concept the group actually discussed. " +
      "Exactly four options each, only one correct.",
    `Study room "${roomName}" session:\n\n${studyText}`,
    900,
  );

  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    const questions = (Array.isArray(parsed.questions) ? parsed.questions : [])
      .filter(
        (q) =>
          q &&
          typeof q.q === "string" &&
          Array.isArray(q.options) &&
          q.options.length === 4,
      )
      .slice(0, 5)
      .map((q) => ({
        q: String(q.q).slice(0, 300),
        options: q.options.map((o) => String(o).slice(0, 200)),
        correct: Math.min(3, Math.max(0, Number(q.correct) || 0)),
        why: String(q.why || "").slice(0, 300),
      }));
    return { questions };
  } catch {
    return { questions: [], note: "Couldn't build a quiz this time — try again in a moment." };
  }
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
// Feature 5 — focus check: how the study session is going
// ---------------------------------------------------------------------------
export async function getRoomVibe(roomName, messages) {
  if (!messages.length) {
    return { mood: "Quiet", emoji: "😴", energy: 1, note: "No messages yet — this room is waiting for its first question." };
  }

  const transcript = messages
    .map((m) => `${m.username}: ${m.content}`)
    .join("\n");

  const raw = await runClaude(
    "You read how a group study session is going. Respond with STRICT JSON only, no code fences, " +
      'shaped exactly: {"mood": string (one or two words, e.g. "Locked in" / "Drifting" / "Confused"), ' +
      '"emoji": string (single emoji), "energy": integer 1-5 (focus level), ' +
      '"note": string (one helpful sentence, max 20 words)}.',
    `Study room "${roomName}" recent messages:\n\n${transcript}`,
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
    "You are the ConnectNext AI Tutor — a patient, encouraging study assistant living inside a " +
    "real-time study-rooms app. You can look things up with the provided tools (study rooms, " +
    "session messages, the user's own progress) before answering. Explain things clearly, " +
    "quiz the user when it helps, and keep answers reasonably short. Use plain text with the " +
    "occasional emoji. If a tool returns nothing useful, say so honestly.";

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
