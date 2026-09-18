# CV Match

AI assistant for recruiters built on the NestJS API + React Router 7 SPA in a pnpm monorepo.

A recruiter uploads a candidate's **CV** (PDF, DOCX, TXT or Markdown) and provides a **job description**
(pasted text or file). The API stores the files in S3-compatible storage, queues a **background job** in BullMQ,
extracts the text, asks **Claude** for a structured assessment and exposes the result to the SPA, which polls
for progress and renders the report.

| Layer | What it does |
| ----- | ------------ |
| Upload | Drag & drop CV + job description, 10 MB limit, type validation on both ends |
| Background processing | BullMQ worker: `pending → extracting → analyzing → completed / failed`, progress persisted per analysis, visible in Bull Board |
| AI | Claude (`claude-opus-5` by default) with structured JSON output validated by TypeBox; a deterministic `mock` adapter for local dev/tests |
| Report | Match score, verdict, requirements coverage (matched / missing), strengths, gaps, red flags, CV feedback for the candidate, tailored interview questions grouped by category |

---

## Table of Contents

1. [Quickstart](#quickstart)
2. [How it works](#how-it-works)
3. [Project layout](#project-layout)
4. [API](#api)
5. [Environment variables](#environment-variables)
6. [Tooling commands](#tooling-commands)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Boilerplate notes](#boilerplate-notes)

---

## Quickstart

1. Install tooling: Node ≥ 24.8 (`.nvmrc` pins 24.8.0, run `nvm install` or use any 24.x), pnpm 10,
   Docker with Compose v2, [Caddy](https://caddyserver.com/docs/install) for local HTTPS (`brew install caddy`).
2. Install dependencies and build shared packages. Use **pnpm only**: the workspace uses `workspace:*`
   dependencies, so `npm install` fails with `Unsupported URL Type "workspace:"`.
   ```sh
   pnpm install
   pnpm build-email && pnpm build-shared
   ```
3. Bootstrap environment files and set your AI credentials:
   ```sh
   cp apps/api/.env.example apps/api/.env
   cp apps/web-app/.env.example apps/web-app/.env
   # in apps/api/.env: ANTHROPIC_API_KEY=sk-ant-...   (or AI_ADAPTER=mock to run without a key)
   ```
4. Start Postgres, Redis, RustFS (S3) and Mailpit:
   ```sh
   docker compose up -d
   ```
5. Run migrations (creates `cv_analysis` and the auth/file tables):
   ```sh
   pnpm db:migrate
   ```
6. First run only, trust the local HTTPS certificates. Caddy generates a local root CA for
   `*.cvmatch.localhost` and asks for your system password to add it to the OS trust store (macOS Keychain).
   Accept the prompt, wait until Caddy reports it is serving, then stop it with `Ctrl+C`; `pnpm dev` starts
   the proxy itself from now on.
   ```sh
   cd apps/reverse-proxy && caddy run
   ```
   If the browser still warns about the certificate, run `caddy trust` in the same folder or restart the browser.
7. From the repo root, start everything (API on port 3000, web on 5173, Caddy in front of both):
   ```sh
   pnpm dev
   ```

| Service | URL |
| ------- | --- |
| Web app | https://app.cvmatch.localhost |
| API | https://api.cvmatch.localhost |
| Swagger | https://api.cvmatch.localhost/api |
| Bull Board (queues) | https://api.cvmatch.localhost/queues (user `admin`, password `BULLBOARD_PASSWORD`) |
| Mailpit | https://mailbox.cvmatch.localhost |

Sign up at `/auth`, then open **Recruiting → New analysis**.

---

## How it works

```
 SPA (React Router 7)                 API (NestJS)                              Worker (BullMQ)
 ───────────────────                  ────────────                              ───────────────
 POST multipart {cv, jobDescription   ─► store files (FileStorageService → S3)
      | jobDescriptionText, title}       insert cv_analysis(status=pending)
                                          queue.add(ANALYZE_CV, {analysisId}) ─► status=extracting (20%)
 GET /cv-analyses/:id  ◄─ poll 2s ─┐                                              download from S3, unpdf / mammoth
                                   │                                              status=analyzing (55%)
                                   │                                              CvAiAdapter.analyze() → Claude
                                   │                                              validate JSON (TypeBox), clamp score
                                   └──────────────────────────────────────────── status=completed (100%) + result
                                                                                  on error: status=failed + errorMessage
```

- **`apps/api/src/cv-analysis`** owns the feature end to end: Drizzle schema, TypeBox DTOs, controller, service,
  BullMQ producer/consumer, text extraction and the AI adapters.
- The **result schema** (`schemas/cv-analysis.schema.ts`) is a TypeBox object that is used three times: as the API
  response DTO, as the JSON schema sent to Claude via `output_config.format`, and to validate what comes back.
- The **`CvAiAdapter`** abstraction has two implementations selected with `AI_ADAPTER`:
  `AnthropicCvAiAdapter` (real model, prompt caching on the system prompt, server-side refusal fallbacks enabled)
  and `MockCvAiAdapter` (keyword overlap, no network). Tests run with the mock.
- The SPA polls list/detail queries every 2 s while any analysis is `pending`/`extracting`/`analyzing`
  (`refetchInterval` in `app/api/queries/useCvAnalyses.ts`).

---

## Project layout

| Path | Description |
| ---- | ----------- |
| `apps/api/src/cv-analysis` | CV analysis feature (schema, controller, service, queue, AI, text extraction, tests) |
| `apps/api/src/file-storage` | S3 storage adapter, extended with `downloadFile` for the worker |
| `apps/api/src/storage/migrations/0003_cv_analysis_init.sql` | Migration for the `cv_analysis` table and status enum |
| `apps/web-app/app/modules/CvAnalysis` | Pages (`/dashboard/cv-analyses`, `/new`, `/:id`) and components (dropzone, timeline, score ring, report) |
| `apps/web-app/app/api/cv-analysis.*` + `queries/`, `mutations/` | Typed API adapter and TanStack Query hooks |
| `apps/web-app/app/locales/{en,pl}.json` | UI copy for the module in English and Polish |
| `apps/reverse-proxy` | Caddy config, domains renamed to `*.cvmatch.localhost` |
| `packages/*` | Shared configs and email templates from the boilerplate |

---

## API

All routes are versioned under `/api/v1` and require a Better Auth session cookie.

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/cv-analyses` | `multipart/form-data`: `cv` (file, required), `jobDescription` (file) **or** `jobDescriptionText` (≥ 30 chars), `title` (optional). Returns the analysis in `pending` state. |
| `GET` | `/cv-analyses` | Current user's analyses, newest first, with `matchScore` when completed |
| `GET` | `/cv-analyses/:id` | Full detail including `result` |
| `POST` | `/cv-analyses/:id/retry` | Re-queue a `failed` analysis |
| `DELETE` | `/cv-analyses/:id` | Delete the analysis and its files (not while processing) |

Run `pnpm generate:client` with the API running to refresh `apps/web-app/app/api/generated-api.ts`; the module
currently talks to these endpoints through the hand-written adapter in `app/api/cv-analysis.api.ts`.

---

## Environment variables

New in this project (see `apps/api/.env.example` for the boilerplate ones):

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `AI_ADAPTER` | `anthropic` | `anthropic` calls Claude, `mock` runs a deterministic keyword-overlap scorer |
| `ANTHROPIC_API_KEY` | — | Required when `AI_ADAPTER=anthropic` |
| `ANTHROPIC_MODEL` | `claude-opus-5` | Any current Claude model id |
| `PORT` | `3000` | API listen port; change it when 3000 is taken (Caddy expects 3000, so adjust `apps/reverse-proxy/Caddyfile` too) |

---

## Tooling commands

- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm format`
- `pnpm db:generate -- --name <migration>` / `pnpm db:migrate` / `pnpm --filter cv-match-api db:studio`
- `pnpm generate:client` regenerates the Swagger client
- `pnpm typecheck:api`, `pnpm --filter cv-match-web tsc`

---

## Testing

```sh
pnpm test:api          # API unit tests (DB-free specs in src/cv-analysis/__tests__ run without infrastructure)
pnpm test:api:e2e      # API e2e, needs Postgres (DATABASE_TEST_URL) + Redis; S3 is replaced in-memory
pnpm test:web          # web unit/component tests (vitest + Testing Library)
```

The CV analysis e2e spec (`cv-analysis.controller.e2e-spec.ts`) uploads a text CV, waits for the BullMQ job to
complete and asserts on the stored result and per-user isolation.

---

## Troubleshooting

- **`Unsupported URL Type "workspace:"`**: you ran `npm install`. Remove any `package-lock.json` it created and use `pnpm install`.
- **`engines` warning or syntax errors on start**: your shell is on an older Node. Run `nvm use` (or `nvm install`) to switch to Node 24.
- **`EADDRINUSE :3000`**: another process owns port 3000. Set `PORT=<free port>` in `apps/api/.env` and update the `api.cvmatch.localhost` upstream in `apps/reverse-proxy/Caddyfile`.
- **Browser rejects `https://*.cvmatch.localhost`**: the local CA is not trusted yet. Run `cd apps/reverse-proxy && caddy trust`, then restart the browser.
- **`ANTHROPIC_API_KEY is required when AI_ADAPTER=anthropic`**: set the key in `apps/api/.env`, or use `AI_ADAPTER=mock` to run the whole pipeline with a deterministic scorer.
- **Stale `.env` or Docker volumes from the Selleo boilerplate**: database, password, bucket, domains and volume names changed (see below). Recreate `.env` from `.env.example` and run `docker compose down -v && docker compose up -d && pnpm db:migrate`.
- **Analyses stay `pending`**: the BullMQ worker cannot reach Redis. Check `docker compose ps` and `REDIS_URL`; job state is visible in Bull Board at `/queues`.

---

## Boilerplate notes

Infrastructure, auth, CI and deployment are inherited from the Selleo boilerplate; see
[`apps/api/README.md`](apps/api/README.md), [`apps/web-app/README.md`](apps/web-app/README.md) and
[`docker-compose.yml`](docker-compose.yml). Package names (`cv-match-api`, `cv-match-web`, `cv-match-reverse-proxy`), local domains (`*.cvmatch.localhost`),
database (`cv_match`) and bucket (`cv-match-prod`) names were renamed from the boilerplate defaults.
