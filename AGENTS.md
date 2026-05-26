# Codex Instructions

## Project

Tapped Inn Network is a pnpm workspace monorepo for an NFC-powered digital identity SaaS platform.

- Node.js 24, pnpm, TypeScript 5.9
- Frontend: `artifacts/tappedinn` with React 19, Vite, TailwindCSS v4, Wouter, TanStack Query
- API: `artifacts/api-server` with Express 5, Clerk auth, Drizzle ORM, PostgreSQL
- Shared packages live under `lib/`

## Key Paths

- `artifacts/tappedinn` - main React app
- `artifacts/api-server` - Express API server
- `artifacts/mockup-sandbox` - UI component sandbox
- `lib/db` - Drizzle schemas and migrations
- `lib/api-spec` - OpenAPI spec and Orval config
- `lib/api-zod` - generated Zod schemas
- `lib/api-client-react` - generated React Query hooks

## Commands

Run commands from the repository root unless a package-specific command is needed.

- `pnpm run typecheck` - full typecheck
- `pnpm run build` - typecheck and build all packages
- `pnpm --filter @workspace/api-spec run codegen` - regenerate API client and Zod schemas
- `pnpm --filter @workspace/db run push` - push DB schema changes in development
- `pnpm --filter @workspace/api-server run build` - build API server only

## Working Rules

- Use pnpm only. The root `preinstall` script rejects npm and yarn lockfiles.
- Keep generated files in sync when changing `lib/api-spec/openapi.yaml`.
- `lib/api-zod/src/index.ts` is overwritten by Orval and should only export `./generated/api`.
- Avatar uploads are stored in `artifacts/api-server/uploads/` and served from `/api/uploads/<filename>`.
- NFC cards are admin-managed only; do not add a user-facing cards page unless explicitly requested.
- Public profile route is `/p/:username`; NFC card redirect route is `/card/:id`.
- App name in UI copy is `Tapped Inn Network`.

## Verification

Prefer focused verification first, then broader checks when behavior crosses package boundaries. For shared API/schema/frontend changes, run `pnpm run typecheck` at minimum.
