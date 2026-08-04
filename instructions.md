# 🧠 CodeShare Platform – Master Plan & Instructions

## 🎯 Goal
Build a production‑ready code‑sharing website (like PasteBin) where users can paste code, get a shareable link, and have it auto‑expire.  
**Antigravity** acts as your AI development team – it writes the code, sets up the database, and deploys everything.

---

## 🧱 Tech Stack (Professional Approach)

| Component          | Technology                                      | Why                                                                 |
|--------------------|-------------------------------------------------|---------------------------------------------------------------------|
| **AI Brain**       | Google Antigravity IDE + SDK                    | Agent‑first development – AI handles almost everything              |
| **Frontend**       | Next.js 16 (React) + TailwindCSS + ShadcnUI    | Vercel‑optimised, serverless, fast, and beautiful                   |
| **Code Editor**    | Monaco Editor                                   | VS‑Code‑powered syntax highlighting for 100+ languages              |
| **Backend API**    | Python 3.12 + FastAPI                           | High performance, async, automatic OpenAPI docs                     |
| **Database**       | Supabase (PostgreSQL)                           | Built‑in auth, Row Level Security (RLS), real‑time subscriptions    |
| **Authentication** | Supabase Auth (JWT)                             | OAuth, email/password, secure session management                    |
| **Hosting**        | Vercel (frontend) + Render (backend)            | Vercel for static + serverless, Render for persistent Python API    |

---

## 📁 Project Structure (to be created by Antigravity)

```
codeshare-platform/
├── frontend/                 # Next.js – deployed on Vercel
│   ├── app/
│   │   ├── page.tsx          # Home: list & create snippets
│   │   ├── snippet/[id]/page.tsx   # Single snippet view
│   │   └── api/              # Optional Next.js API routes
│   ├── components/           # UI components
│   ├── lib/                  # Supabase client, utilities
│   └── package.json
├── backend/                  # FastAPI – deployed on Render
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── models.py         # SQLModel (Pydantic + SQLAlchemy)
│   │   ├── crud.py           # Database operations
│   │   ├── auth.py           # Supabase JWT verification
│   │   └── routes/
│   │       ├── snippets.py   # CRUD endpoints
│   │       └── users.py      # User endpoints
│   ├── requirements.txt
│   ├── Dockerfile            # For Render containerisation
│   └── render.yaml           # Render Blueprint
├── .agents/                  # Antigravity team definitions
│   ├── agents.md
│   ├── skills/
│   │   ├── backend‑specialist.md
│   │   ├── frontend‑specialist.md
│   │   └── deploy‑ops.md
│   └── workflows/
├── AGENTS.md                 # Project‑wide rules for all AI agents
└── instructions.md           # This file
```

---

## 🚀 Step‑by‑Step Implementation Plan

### ✅ Phase 0 – Prerequisites
- Install [Antigravity IDE](https://antigravity.google)  
- Install Python 3.12+ and Node.js 18+  
- Create accounts on [Supabase](https://supabase.com), [Vercel](https://vercel.com), and [Render](https://render.com)

---

### ✅ Phase 1 – Database Setup (Supabase)

1. In Supabase Dashboard, go to **SQL Editor** and run:

```sql
-- Snippets table
CREATE TABLE snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    view_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Public snippets are viewable by everyone"
    ON snippets FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can CRUD own snippets"
    ON snippets FOR ALL USING (auth.uid() = user_id);
```

2. Copy your **Project URL** and **anon/public key** – you’ll need them later.

---

### ✅ Phase 2 – Configure Antigravity AI Team

Create **`AGENTS.md`** in the project root – this is the **constitution** for every AI agent:

```markdown
# AGENTS.md – CodeShare Platform Rules

## Tech Stack
- Frontend: Next.js 16, React, TailwindCSS, ShadcnUI, Monaco Editor
- Backend: Python 3.12, FastAPI, SQLModel
- Database: Supabase PostgreSQL with RLS
- Deployment: Vercel (frontend), Render (backend)

## Code Quality
- Python: PEP 8, type hints, max 100 chars/line
- TypeScript: strict mode, no `any`
- Write tests for all API endpoints

## Git Conventions
- Commit format: `type(scope): description` (feat, fix, docs, chore)
- PRs ≤ 400 lines with clear description

## Safety Guardrails
- NEVER run destructive DB commands without user confirmation
- NEVER deploy to production unless all tests pass
- ALWAYS ask before touching auth or payment logic

## Project Rules
- All snippets have syntax highlighting
- Default expiry: 30 days
- All data access must go through Supabase RLS
```

Then create **`.agents/agents.md`** to define team roles:

```markdown
# AI Developer Team

## Backend Specialist
- Senior Python/FastAPI developer
- Builds all API endpoints, models, and Supabase integration

## Frontend Specialist
- Senior Next.js/React developer
- Builds UI, Monaco editor, and Supabase client integration

## DevOps Engineer
- Configures Vercel, Render, environment variables, and CI/CD
```

And add a skill file **`.agents/skills/backend‑specialist.md`** with a code template (Antigravity will use it to generate consistent endpoints).

---

### ✅ Phase 3 – Build the Backend (Antigravity will do it)

In Antigravity IDE, type this prompt to your **Backend Specialist**:

> *"Backend Specialist, build the complete FastAPI backend for our code‑sharing platform. Use SQLModel, integrate Supabase Auth for JWT validation, implement all CRUD operations for snippets, add expiration logic, and write pytest unit tests. Also produce a Dockerfile and a render.yaml for deployment."*

Antigravity will generate:
- `backend/app/main.py`
- `backend/app/models.py` (Snippet, User)
- `backend/app/crud.py`
- `backend/app/auth.py` (Supabase JWT decoding)
- `backend/app/routes/snippets.py`
- `backend/requirements.txt`
- `backend/Dockerfile`
- `backend/render.yaml`

**Key dependencies** (will be in `requirements.txt`):
```
fastapi==0.115.6
uvicorn==0.34.0
sqlmodel==0.0.22
supabase-py==2.8.0
python-dotenv==1.0.1
pytest==8.3.4
python-multipart==0.0.20
```

---

### ✅ Phase 4 – Build the Frontend (Antigravity will do it)

Prompt your **Frontend Specialist**:

> *"Frontend Specialist, build the Next.js 16 frontend with App Router. Integrate Monaco Editor for syntax highlighting. Use the Supabase client for authentication and data fetching. Create three pages: home (list snippets), new snippet (form with language selector), and detail page (display code with highlighting). Style with TailwindCSS and ShadcnUI components."*

Antigravity will generate:
- `frontend/app/page.tsx`
- `frontend/app/snippet/[id]/page.tsx`
- `frontend/components/` (editor, snippet cards, navbar)
- `frontend/lib/supabase.ts` (client initialisation)
- `frontend/package.json` with dependencies

---

### ✅ Phase 5 – Connect Supabase MCP to Antigravity

Antigravity can directly operate Supabase via MCP (Model Context Protocol).  
**Option A – using Composio** (easiest):
1. Register at [Composio](https://composio.dev) and get an API key.
2. In Antigravity IDE, add a new MCP server with the Supabase connector.

**Option B – using One CLI**:
```bash
npm i -g @withone/cli
one init          # get free API key
one add supabase  # handles OAuth automatically
```

Once connected, Antigravity agents can **query, insert, update, and manage your Supabase tables** directly.

---

### ✅ Phase 6 – Deployment

#### Deploy Backend to Render

- Push your code to a GitHub repository.
- In Render Dashboard, click **New +** → **Blueprint**.
- Select your repo – Render will auto‑detect `render.yaml`.
- Set environment variables in Render:
  - `DATABASE_URL` = your Supabase Postgres connection string
  - `SUPABASE_JWT_SECRET` = your Supabase JWT secret (from project settings)
  - `SUPABASE_URL` and `SUPABASE_ANON_KEY` as needed

#### Deploy Frontend to Vercel

- In the `frontend` folder, run:
```bash
vercel --prod
```
- Follow the prompts and link to your Vercel project.
- Set environment variables in Vercel Dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g., `https://codeshare-backend.onrender.com`)

---

### ✅ Phase 7 – Verify & Go Live

- Visit your Vercel URL – you should see the homepage.
- Create a new snippet (with or without logging in).
- Copy the shareable link and open it in another browser – the code should appear with syntax highlighting.
- Confirm that the snippet disappears after 30 days (or test with a shorter expiry).

---

## 🎉 Success Criteria

- [x] Snippets can be created, viewed, and shared via unique URLs.
- [x] Syntax highlighting works for all major languages.
- [x] Authentication via Supabase (optional, but enabled).
- [x] RLS ensures users can only edit their own snippets.
- [x] Auto‑expiry after 30 days.
- [x] Backend deployed on Render with health checks.
- [x] Frontend deployed on Vercel with global CDN.

---

## 📚 Additional Tips

- **Let Antigravity handle everything** – after each prompt, review the generated code, run local tests, and then approve.
- **Use the built‑in terminal** in Antigravity to run `pytest`, `npm run build`, etc.
- **Update AGENTS.md** as you learn – the agents will adapt to any changes.

---

## 🔗 Reference Links

- [Antigravity Docs](https://antigravity.google/docs)
- [Supabase Python Client](https://supabase.com/docs/reference/python)
- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)
- [Render Python Deployment](https://render.com/docs/deploy-python)
