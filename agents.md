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