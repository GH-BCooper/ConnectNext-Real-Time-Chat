# ConnectNext — Version 2

What changed since v1: two AI features powered by the Claude API, plus a couple of bug fixes.

## New Tech

- **`@anthropic-ai/sdk`** (server) — official Anthropic SDK, calls the Claude Messages API
- **Model:** `claude-opus-5` (override with `AI_MODEL` in `server/.env`)

## New Features

### 1. AI Assistant in chat (`/ai` or `@ai`)

Type `/ai <question>` (or `@ai <question>`) in any room and Claude replies right in the chat as **✨ AI Assistant**, visible to everyone in the room in real time.

- Client: [RoomChat.tsx](client/src/pages/RoomChat.tsx) — bot messages get a distinct purple bubble + a "thinking..." indicator (`aiTyping` socket event)
- Server: [index.js](server/index.js) — `sendMessage` handler detects the command, calls `getAIReply()`, stores the reply under a dedicated `AI Assistant` bot user, and broadcasts it like a normal message
- AI logic: [server/lib/ai.js](server/lib/ai.js)

### 2. Conversation Summarizer (✨ Summarize button)

Click **✨ Summarize** in any room's header to get a short AI-generated digest (key topics, decisions, action items) of the last 50 messages, shown in a modal.

- Client: [RoomChat.tsx](client/src/pages/RoomChat.tsx) — summarize button + modal
- Server: `GET /ai/summarize/:roomId` in [server/routes/aiRoutes.js](server/routes/aiRoutes.js), using `getConversationSummary()` in [server/lib/ai.js](server/lib/ai.js)

## Setup

Add your Anthropic API key to `server/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at https://console.anthropic.com/. Without it, the rest of the app works normally — only the two AI features will fail (with an error message instead of a crash).

## Bugs fixed

- **Sessions weren't actually persisted to Postgres.** `connect-pg-simple` was installed and imported but never wired into `express-session` — every server restart silently logged everyone out. Now sessions are stored in Postgres and survive restarts.
- **"Exit Room" didn't clean up server-side state.** The client emitted a `leaveRoom` event the server never listened for, so a user who clicked "Exit Room" stayed in the room's online-users list until their socket disconnected. Added a matching `leaveRoom` handler.
