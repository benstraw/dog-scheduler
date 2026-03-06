# Repository Guidelines

## Project Structure & Module Organization
Dog Scheduler is an Astro SSR app with Descope-based access control.
- `src/pages/`: Route entrypoints (`/`, `/login`, `/pending`, `/schedule`) plus API routes in `src/pages/api/`.
- `src/components/`: Shared UI components (`Layout.astro`, `LoginButton.astro`, `LogoutButton.astro`).
- `src/lib/`: Server-side logic only (`authGuard.ts`, `descope.ts`).
- `src/styles/`: Global CSS (`global.css`).
- Root config and env templates: `astro.config.mjs`, `tsconfig.json`, `.env.example`.

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm run dev`: Start local server (`http://localhost:4321`).
- `npm run build`: Build production output.
- `npm run preview`: Preview production build locally.
- `npm run astro -- check`: Type and Astro checks.

Run `npm run build` and `npm run astro -- check` before opening a PR.

## Coding Style & Naming Conventions
- TypeScript is strict; avoid `any` and use explicit interfaces/types.
- Keep server logic in `src/lib`; keep page frontmatter thin and focused on orchestration.
- Use `PascalCase.astro` for components, lowercase route files in `src/pages`, and `camelCase.ts` in `src/lib`.
- Use `import.meta.env.*` in Astro files; do not use `process.env` in `.astro` pages.
- Keep comments for non-obvious auth/session behavior only.

## Auth & Access Control Rules
- Protected pages must use `requireAuth` or `requireApproved` from `src/lib/authGuard.ts`.
- Guard helpers return either a redirect `Response` or user data; always propagate redirects first.
- Status mapping is fixed: `PENDING` -> `/pending`, `DISABLED` -> `/pending?disabled=1`, `APPROVED` -> `/schedule`.
- Descope session cookie name is `DS`.

## Testing Guidelines
No dedicated automated test suite is configured.
Minimum manual checks per change:
- Authentication flow on `/login`.
- Access behavior for `/pending` and `/schedule` by user status.
- Missing-env behavior (for example missing `DESCOPE_PROJECT_ID`).

## Commit & Pull Request Guidelines
- Use Conventional Commit style when possible (`fix:`, `chore:`, `docs:`).
- Keep commits focused to one logical change.
- PRs should include: purpose, user-facing impact, manual verification steps, and screenshots for UI changes.
- Call out any environment variable or Vercel configuration changes.

## Security & Architecture Constraints
- Never commit secrets or `.env`.
- Required env vars: `DESCOPE_PROJECT_ID`, `GOOGLE_SCHEDULING_EMBED_URL`.
- Do not add a database dependency; persistent user state remains in Descope custom attributes.
- Do not introduce additional frontend UI frameworks.
