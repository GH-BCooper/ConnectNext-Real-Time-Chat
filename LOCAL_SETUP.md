# Local Development Setup Guide

## Prerequisites

- Node.js and npm installed
- PostgreSQL installed and running
- Git (optional)

## Step 1: Set up the Database

### 1.1 Create the database

Open your terminal and connect to PostgreSQL:

```bash
psql -U postgres
```

Then create the database:

```sql
CREATE DATABASE connectnext;
```

Exit with `\q`

### 1.2 Create the schema

Run the schema file from the server directory:

```bash
cd server
psql -U postgres -d connectnext -f schema.sql
```

You should see output like:

```
CREATE TABLE
CREATE TABLE
CREATE TABLE
INSERT 0 3
```

Verify the tables were created:

```bash
psql -U postgres -d connectnext
```

Then in psql:

```sql
\dt
```

You should see: users, rooms, messages tables

Exit with `\q`

## Step 2: Install Dependencies

### Client

```bash
cd client
npm install
```

### Server

```bash
cd server
npm install
```

## Step 3: Run the Application

### Terminal 1 - Start the Server

```bash
cd server
npm run dev
```

You should see:

```
Server running on port 5000
```

### Terminal 2 - Start the Client

```bash
cd client
npm run dev
```

You should see output with a local URL like:

```
Local:   http://localhost:5173/
```

## Step 4: Test the Application

1. Open http://localhost:5173 in your browser
2. Click "Register here"
3. Fill in:
   - Username: testuser
   - Email: test@example.com
   - Password: password123
4. Click Register
5. You should be redirected to the Dashboard
6. Click Logout
7. You should be back at the Login page
8. Test login with the credentials you just created

## Troubleshooting

### "Error connecting to database"

- Make sure PostgreSQL is running
- Check DB credentials in server/.env match your PostgreSQL setup
- Run `psql -U postgres` to verify you can connect

### "Cannot POST /auth/register"

- Make sure server is running on port 5000
- Check server terminal for errors

### "Cannot connect to localhost:5000"

- Make sure server has started successfully
- Check that both client and server are running in separate terminals

### "EADDRINUSE: address already in use :::5000"

- Another process is using port 5000
- Either kill that process or change the PORT in server/.env

## Environment Variables

**server/.env** (Already configured for local dev):

```
PORT=5000
DB_USER=postgres
DB_PASSWORD=postgre@bCooper
DB_HOST=localhost
DB_PORT=5432
DB_NAME=connectnext
CLIENT_URL=http://localhost:5173
SESSION_SECRET=connectnextsecret-local-dev
NODE_ENV=development
```

**client/.env** (Already created):

```
VITE_API_URL=http://localhost:5000
```

## For Production Deployment Later

When deploying to Vercel/Render/Neon, you'll need to:

1. Update server/.env with production DATABASE_URL
2. Update client/.env with VITE_API_URL pointing to your deployed server
3. Run database migrations on production database

See deployment docs for each platform for detailed instructions.
