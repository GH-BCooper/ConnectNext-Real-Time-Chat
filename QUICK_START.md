# Quick Start - Local Testing

## 1. Setup Database (One-time)

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE connectnext;"

# Load / update the schema (safe to re-run on an existing DB)
psql -U postgres -d connectnext -f server/schema.sql
```

## 2. Install Dependencies

```bash
# Terminal 1
cd client
npm install

# Terminal 2
cd server
npm install
```

## 3. Run Everything

**Terminal 1: Start Server**

```bash
cd server
npm run dev
```

**Terminal 2: Start Client**

```bash
cd client
npm run dev
```

## 4. Test

Open http://localhost:5173, register, create a room, and chat. Try `/ai hello`
inside a room, and the **✨ Summarize** / **💡 Icebreakers** / **✨ Polish**
buttons (these need `ANTHROPIC_API_KEY` set in `server/.env`).

---

**Already done for you:**

- ✅ server/.env configured for local PostgreSQL
- ✅ client/.env configured to point to localhost:5000
- ✅ server/schema.sql — safe to re-run, auto-migrates older databases

Add `ANTHROPIC_API_KEY` to `server/.env` for the AI features (optional).
