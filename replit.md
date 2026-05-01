# Tapped Inn Network

## Overview

**Tapped Inn Network** — NFC-powered digital identity platform. Multi-tenant SaaS: React+Vite frontend at `/`, Express API at `/api`, PostgreSQL via Drizzle ORM, Clerk auth.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite + TailwindCSS v4, Wouter routing, TanStack Query
- **Auth**: Clerk (via `@clerk/react`, `@clerk/express`)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **File uploads**: Multer (stored in `artifacts/api-server/uploads/`, served at `/api/uploads/`)

## Artifacts

- `artifacts/tappedinn` — React+Vite frontend (`@workspace/tappedinn`)
- `artifacts/api-server` — Express API server (`@workspace/api-server`)
- `artifacts/mockup-sandbox` — UI component sandbox

## Lib Packages

- `lib/db` — Drizzle ORM schemas + migrations (`@workspace/db`)
- `lib/api-spec` — OpenAPI YAML spec (`@workspace/api-spec`)
- `lib/api-zod` — Generated Zod schemas from OpenAPI (`@workspace/api-zod`) — only exports `./generated/api`
- `lib/api-client-react` — Generated TanStack Query hooks (`@workspace/api-client-react`)

## DB Schema (lib/db/src/schema/)

- `users` — Clerk user IDs
- `profiles` — username, displayName, bio, avatarUrl, **phone**, **email**, **website**, **contactSettings** (JSONB), themeSettings (JSONB)
- `links` — title, url, position, profileId
- `cards` — NFC cards (admin-managed, not user-facing)
- `connections` — social graph edges
- `analytics` — event tracking (view, click, tap)

## Frontend Pages

- `/` — Landing page (public, redirect to dashboard if signed in)
- `/sign-in`, `/sign-up` — Clerk auth pages
- `/dashboard` — Stats, quick actions, recent activity
- `/edit-profile` — Avatar upload, contact info (phone/email/website), theme settings, profile style
- `/edit-links` — Drag-to-reorder links manager
- `/connections` — Social connections
- `/analytics` — Analytics charts
- `/modes` — Profile Modes management (create/edit/activate modes, each with its own displayName, bio, emoji)
- `/p/:username` — Public profile with contact buttons (Call/Email/Website) + link list + theme applied + active mode badge
- `/card/:id` — NFC card redirect (hits backend, redirects to `/p/username`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run build` — build API server

## Important Notes

- `lib/api-zod/src/index.ts` gets overwritten by orval codegen — must only export `./generated/api`
- Avatar uploads stored at `artifacts/api-server/uploads/`, served at `/api/uploads/<filename>`
- NFC cards are admin-managed only — no cards page in frontend
- Profile Modes: `profile_modes` table, CRUD at `/api/modes`, activate/deactivate endpoints. Active mode overrides displayName/bio/themeSettings on the public profile response. Dashboard shows active mode banner with quick-switch link.
- Theme: dark background `hsl(240 10% 4%)`, purple primary `hsl(262 83% 68%)`, Plus Jakarta Sans + Space Grotesk fonts
- APP_NAME constant = "Tapped Inn Network" — used everywhere in UI copy
