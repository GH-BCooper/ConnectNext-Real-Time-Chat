# Quick Start - Local Testing

## 1. Setup Database (One-time)

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql:
CREATE DATABASE connectnext;
\q

# Setup schema
cd server
psql -U postgres -d connectnext -f schema.sql
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

Open http://localhost:5173 in your browser and register!

---

**Already Done For You:**

- ✅ server/.env configured for local PostgreSQL
- ✅ client/.env configured to point to localhost:5000
- ✅ server/schema.sql created with database tables
- ✅ Code bugs fixed

Just follow the 4 steps above!
