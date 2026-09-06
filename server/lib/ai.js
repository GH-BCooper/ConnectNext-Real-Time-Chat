// ---------------------------------------------------------------------------
// AI layer — powered by Groq (OpenAI-compatible chat completions API).
// One place for every Claude/LLM call the app makes.
// ---------------------------------------------------------------------------

// Groq API key. `GROQ_API_KEY` is the canonical name; `GROK_API_KEY` is accepted
// as a fallback because it's an easy typo.
const GROQ_KEY = process.env.GROQ_API_KEY || process.env.GROK_API_KEY || "";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Default model — fast, capable, supports tool use + JSON mode on Groq.
// Override with AI_MODEL in server/.env (e.g. "openai/gpt-oss-20b" for speed).
const MODEL = process.env.AI_MODEL || "openai/gpt-oss-120b";

// Reserved username shown for AI-generated messages
export const AI_BOT_USERNAME = "AI Assistant";

// True only when an API key is configured. Routes use this to return a friendly
// "AI is off" message instead of a 500 error.
export function aiAvailable() {
  return Boolean(GROQ_KEY);
}

export const AI_MODEL_NAME = MODEL;

// ---------------------------------------------------------------------------
// Low-level: one chat-completions call. Returns the raw `message` object.
// ---------------------------------------------------------------------------
async function chat({ messages, maxTokens = 600, tools, jsonMode = false }) {
  const body = {
    model: MODEL,
    max_tokens: maxTokens,
    messages,
  };
  if (tools && tools.length) body.tools = tools;
  if (jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq API ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message || {};
}

// ---------------------------------------------------------------------------
// Shared helper: one system + user prompt -> plain text answer
// ---------------------------------------------------------------------------
async function runLLM(system, user, maxTokens = 600, jsonMode = false) {
  const message = await chat({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    maxTokens,
    jsonMode,
  });
  return (message.content || "").trim();
}

// ---------------------------------------------------------------------------
// Feature 1 — short in-room reply from the AI tutor (/ai or @ai)
// ---------------------------------------------------------------------------
export async function getAIReply(question) {
  const reply = await runLLM(
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

  const summary = await runLLM(
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

  const text = await runLLM(
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

  const raw = await runLLM(
    "You write short recall quizzes from a study session. Respond with STRICT JSON only, " +
      "no code fences, shaped exactly: " +
      '{"questions": [{"q": string, "options": [string, string, string, string], ' +
      '"correct": integer 0-3, "why": string (one sentence)}]}. ' +
      "Write 3 to 5 questions, each testing a concept the group actually discussed. " +
      "Exactly four options each, only one correct.",
    `Study room "${roomName}" session:\n\n${studyText}`,
    900,
    true,
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
  const polished = await runLLM(
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

  const raw = await runLLM(
    "You read how a group study session is going. Respond with STRICT JSON only, no code fences, " +
      'shaped exactly: {"mood": string (one or two words, e.g. "Locked in" / "Drifting" / "Confused"), ' +
      '"emoji": string (single emoji), "energy": integer 1-5 (focus level), ' +
      '"note": string (one helpful sentence, max 20 words)}.',
    `Study room "${roomName}" recent messages:\n\n${transcript}`,
    300,
    true,
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
// Feature 6 — agentic AI Companion with tool use + memory
// ---------------------------------------------------------------------------
// `history` is the running conversation [{ role: "user"|"assistant", content }].
// `tools` is [{ name, description, input_schema }] (Anthropic-style — converted
//   here to the OpenAI/Groq function-tool shape).
// `runTool(name, input)` executes a tool and returns a string result.
// Returns { reply, toolsUsed: string[] }.
export async function runCompanion(history, tools, runTool) {
  const system =
    "You are the ConnectNext AI Tutor — a patient, encouraging study assistant living inside a " +
    "real-time study-rooms app. You can look things up with the provided tools (study rooms, " +
    "session messages, the user's own progress) before answering. Explain things clearly, " +
    "quiz the user when it helps, and keep answers reasonably short. Use plain text with the " +
    "occasional emoji. If a tool returns nothing useful, say so honestly.";

  const openaiTools = tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.input_schema || { type: "object", properties: {} },
    },
  }));

  const messages = [
    { role: "system", content: system },
    ...history.slice(-12).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 4000),
    })),
  ];

  const toolsUsed = [];

  for (let step = 0; step < 5; step++) {
    const message = await chat({
      messages,
      maxTokens: 900,
      tools: openaiTools,
    });

    const calls = message.tool_calls || [];

    if (calls.length === 0) {
      return { reply: (message.content || "").trim() || "…", toolsUsed };
    }

    // Record the assistant turn that requested the tools.
    messages.push({
      role: "assistant",
      content: message.content || "",
      tool_calls: calls,
    });

    for (const call of calls) {
      const name = call.function?.name;
      toolsUsed.push(name);
      let input = {};
      try {
        input = JSON.parse(call.function?.arguments || "{}");
      } catch {
        input = {};
      }
      let result;
      try {
        result = await runTool(name, input);
      } catch (err) {
        result = `Tool error: ${err.message}`;
      }
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: String(result).slice(0, 6000),
      });
    }
  }

  return { reply: "I looked into that but couldn't wrap it up — try asking again.", toolsUsed };
}
