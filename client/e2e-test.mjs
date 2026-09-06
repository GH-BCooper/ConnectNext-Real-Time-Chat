// End-to-end pipeline test for ConnectNext.
// Exercises auth, rooms, messages, search, stats, every AI endpoint, and the
// real-time Socket.IO layer (including the in-room /ai trigger).
import { io } from "socket.io-client";

const API = "http://localhost:5000";
const stamp = Date.now();
const user = {
  username: `e2e_${stamp}`,
  email: `e2e_${stamp}@test.local`,
  password: "test123456",
};

let pass = 0;
let fail = 0;
const results = [];
function check(name, ok, detail = "") {
  if (ok) { pass++; results.push(`  PASS  ${name}`); }
  else { fail++; results.push(`  FAIL  ${name}  ${detail}`); }
}

// tiny cookie jar
let cookie = "";
async function req(method, path, body, opts = {}) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const setC = res.headers.get("set-cookie");
  if (setC && !opts.keepCookie) cookie = setC.split(";")[0];
  let data = null;
  const txt = await res.text();
  try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
  return { status: res.status, data };
}

async function main() {
  console.log(`\n=== ConnectNext E2E — user ${user.username} ===\n`);

  // ---- health ----
  let r = await req("GET", "/health");
  check("GET /health ok", r.status === 200 && r.data?.ok === true, JSON.stringify(r.data));

  r = await req("GET", "/ai/status");
  const aiOn = r.data?.available === true;
  check("GET /ai/status", r.status === 200, JSON.stringify(r.data));
  console.log(`  (AI available: ${aiOn}, model: ${r.data?.model})\n`);

  // ---- auth: unauthenticated guard ----
  r = await req("GET", "/rooms");
  check("GET /rooms without session -> 401", r.status === 401, `got ${r.status}`);

  r = await req("GET", "/auth/me");
  check("GET /auth/me without session -> 401", r.status === 401, `got ${r.status}`);

  // ---- register ----
  r = await req("POST", "/auth/register", user);
  check("POST /auth/register", r.status === 200 && r.data?.user?.id, JSON.stringify(r.data));
  const userId = r.data?.user?.id;

  r = await req("GET", "/auth/me");
  check("GET /auth/me after register", r.status === 200 && r.data?.username === user.username, JSON.stringify(r.data));

  // ---- duplicate register ----
  r = await req("POST", "/auth/register", user, { keepCookie: true });
  check("duplicate register -> 400", r.status === 400, `got ${r.status}`);

  // ---- logout + login ----
  r = await req("POST", "/auth/logout");
  check("POST /auth/logout", r.status === 200, JSON.stringify(r.data));

  r = await req("GET", "/auth/me");
  check("GET /auth/me after logout -> 401", r.status === 401, `got ${r.status}`);

  r = await req("POST", "/auth/login", { email: user.email, password: "wrongpass" });
  check("login wrong password -> 400", r.status === 400, `got ${r.status}`);

  r = await req("POST", "/auth/login", { email: user.email, password: user.password });
  check("POST /auth/login", r.status === 200 && r.data?.user?.username === user.username, JSON.stringify(r.data));

  // ---- rooms ----
  r = await req("GET", "/rooms");
  check("GET /rooms", r.status === 200 && Array.isArray(r.data), JSON.stringify(r.data).slice(0, 120));
  const roomCountBefore = Array.isArray(r.data) ? r.data.length : 0;

  const roomName = `E2E Room ${stamp}`;
  r = await req("POST", "/rooms", { name: roomName, description: "Photosynthesis basics" });
  check("POST /rooms create", r.status === 201 && r.data?.id, JSON.stringify(r.data));
  const roomId = r.data?.id;

  r = await req("POST", "/rooms", { name: roomName, description: "dup" });
  check("POST /rooms duplicate name -> 400", r.status === 400, `got ${r.status}`);

  r = await req("POST", "/rooms", { name: "   " });
  check("POST /rooms blank name -> 400", r.status === 400, `got ${r.status}`);

  r = await req("GET", "/rooms");
  check("GET /rooms includes new room", Array.isArray(r.data) && r.data.some((x) => x.id === roomId), "");

  // ---- messages via socket ----
  await socketPhase(roomId, aiOn);

  // ---- messages REST ----
  r = await req("GET", `/messages/${roomId}`);
  const msgs = Array.isArray(r.data) ? r.data : [];
  check("GET /messages/:roomId", r.status === 200 && msgs.length >= 3, `count=${msgs.length}`);
  check("messages ordered oldest-first", msgs.length < 2 || new Date(msgs[0].created_at) <= new Date(msgs[msgs.length - 1].created_at), "");

  // ---- search ----
  r = await req("GET", `/messages/search?q=photosynthesis`);
  check("GET /messages/search hit", r.status === 200 && Array.isArray(r.data) && r.data.length >= 1, `count=${r.data?.length}`);
  r = await req("GET", `/messages/search?q=a`);
  check("GET /messages/search <2 chars -> []", r.status === 200 && Array.isArray(r.data) && r.data.length === 0, "");

  // ---- stats ----
  r = await req("GET", "/users/stats");
  check("GET /users/stats", r.status === 200 && r.data?.username === user.username, JSON.stringify(r.data));
  check("stats messageCount >= 3", r.data?.messageCount >= 3, `got ${r.data?.messageCount}`);
  check("stats roomsCreated >= 1", r.data?.roomsCreated >= 1, `got ${r.data?.roomsCreated}`);

  // ---- AI endpoints ----
  await aiPhase(roomId, aiOn);

  // ---- summary ----
  console.log("\n" + results.join("\n"));
  console.log(`\n=== ${pass} passed, ${fail} failed ===\n`);
  process.exit(fail ? 1 : 0);
}

function socketPhase(roomId, aiOn) {
  return new Promise((resolve) => {
    const socket = io(API, { transports: ["websocket"], extraHeaders: { Cookie: cookie } });
    const received = [];
    let sawSystem = false;
    let sawAiTyping = false;
    let aiReplied = false;

    socket.on("connect", () => {
      check("socket connect", true);
      socket.emit("joinRoom", { roomId, username: user.username });
      setTimeout(() => {
        socket.emit("sendMessage", { roomId, message: "Photosynthesis converts light energy into glucose.", username: user.username });
      }, 300);
      setTimeout(() => {
        socket.emit("sendMessage", { roomId, message: "It happens in the chloroplast, mainly in the thylakoid membranes.", username: user.username });
      }, 800);
      setTimeout(() => {
        socket.emit("sendMessage", { roomId, message: "The Calvin cycle is the light-independent stage.", username: user.username });
      }, 1300);
      if (aiOn) {
        setTimeout(() => {
          socket.emit("sendMessage", { roomId, message: "/ai what is the role of chlorophyll in one sentence?", username: user.username });
        }, 1900);
      }
    });

    socket.on("receiveMessage", (m) => {
      received.push(m);
      if (m.username === "AI Assistant") aiReplied = true;
    });
    socket.on("systemMessage", () => { sawSystem = true; });
    socket.on("aiTyping", (v) => { if (v) sawAiTyping = true; });
    socket.on("connect_error", (e) => check("socket connect", false, e.message));

    setTimeout(() => {
      check("socket receiveMessage broadcast", received.filter((m) => m.username === user.username).length >= 3, `got ${received.length}`);
      if (aiOn) {
        check("socket /ai trigger -> aiTyping event", sawAiTyping);
        check("socket /ai trigger -> AI Assistant reply in room", aiReplied);
      }
      socket.emit("leaveRoom", { roomId, username: user.username });
      socket.close();
      resolve();
    }, aiOn ? 12000 : 3500);
  });
}

async function aiPhase(roomId, aiOn) {
  if (!aiOn) {
    let r = await req("GET", `/ai/quiz/${roomId}`);
    check("AI off: /ai/quiz -> 503", r.status === 503, `got ${r.status}`);
    return;
  }

  let r = await req("GET", `/ai/summarize/${roomId}`);
  check("GET /ai/summarize", r.status === 200 && typeof r.data?.summary === "string" && r.data.summary.length > 10, JSON.stringify(r.data).slice(0, 160));

  r = await req("GET", `/ai/icebreakers/${roomId}`);
  check("GET /ai/icebreakers", r.status === 200 && typeof r.data?.ideas === "string" && r.data.ideas.length > 10, JSON.stringify(r.data).slice(0, 160));

  r = await req("GET", `/ai/quiz/${roomId}`);
  const qs = r.data?.questions;
  check("GET /ai/quiz shape", r.status === 200 && Array.isArray(qs) && qs.length >= 1, JSON.stringify(r.data).slice(0, 200));
  if (Array.isArray(qs) && qs.length) {
    const q0 = qs[0];
    check("quiz question shape", typeof q0.q === "string" && Array.isArray(q0.options) && q0.options.length === 4 && q0.correct >= 0 && q0.correct <= 3, JSON.stringify(q0).slice(0, 200));
  }

  r = await req("GET", `/ai/vibe/${roomId}`);
  check("GET /ai/vibe shape", r.status === 200 && typeof r.data?.mood === "string" && r.data?.energy >= 1 && r.data?.energy <= 5, JSON.stringify(r.data).slice(0, 160));

  r = await req("POST", "/ai/polish", { text: "hey so i think teh calvin cycle is where co2 get fixed rite" });
  check("POST /ai/polish", r.status === 200 && typeof r.data?.polished === "string" && r.data.polished.length > 5, JSON.stringify(r.data).slice(0, 160));

  r = await req("POST", "/ai/polish", { text: "" });
  check("POST /ai/polish empty -> 400", r.status === 400, `got ${r.status}`);

  // companion agent loop — should use at least one tool
  r = await req("POST", "/ai/companion", {
    messages: [{ role: "user", content: "How many messages have I sent, and which study room is mine?" }],
  });
  check("POST /ai/companion reply", r.status === 200 && typeof r.data?.reply === "string" && r.data.reply.length > 5, JSON.stringify(r.data).slice(0, 200));
  check("POST /ai/companion used a tool", Array.isArray(r.data?.toolsUsed) && r.data.toolsUsed.length >= 1, JSON.stringify(r.data?.toolsUsed));

  r = await req("POST", "/ai/companion", { messages: [] });
  check("POST /ai/companion empty -> 400", r.status === 400, `got ${r.status}`);

  r = await req("GET", "/ai/summarize/99999999");
  check("GET /ai/summarize unknown room -> graceful", r.status === 200 || r.status === 404, `got ${r.status}`);
}

main().catch((e) => { console.error("E2E crashed:", e); process.exit(1); });
