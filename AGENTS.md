# Repository Guidelines

## Project Structure & Module Organization

Dog Scheduler is an Astro SSR app — a **private membership adventure service for dogs** — with Descope-based access control. The system has a public marketing site, a membership request flow, member onboarding, and a member portal for booking hikes.

- `src/pages/`: Route entrypoints for the full system (see routing table below) plus API routes in `src/pages/api/`.
- `src/components/`: Shared UI components (`Layout.astro`, `LoginButton.astro`, `LogoutButton.astro`).
- `src/lib/`: Server-side logic only (`authGuard.ts`, `descope.ts`).
- `src/styles/`: Global CSS (`global.css`).
- Root config and env templates: `astro.config.mjs`, `tsconfig.json`, `.env.example`.

### Planned pages

| File | Route | Description |
|---|---|---|
| `index.astro` | `/` | Public homepage — hero, trust photos, testimonials, about preview |
| `about.astro` | `/about` | About — background, philosophy, adventure logistics |
| `gallery.astro` | `/gallery` | Photo gallery — emotional trust signals |
| `request.astro` | `/request` | Membership request — Descope sign-up, status → `PENDING` |
| `login.astro` | `/login` | Member login — Descope widget + post-login redirect |
| `pending.astro` | `/pending` | Awaiting-approval or disabled message |
| `onboarding.astro` | `/onboarding` | Member onboarding — owner info + dog profile |
| `member.astro` | `/member` | Member Home — book hike, upcoming bookings, profile links |
| `schedule.astro` | `/schedule` | Booking — tabbed 2-hour/4-hour Google Calendar embeds |
| `adventure-request.astro` | `/adventure-request` | Custom Adventure Request form |

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
- Navigation order: Home · About · Request Membership · Member Login.
- Tone: calm, trust-driven; minimal marketing language; strong visual proof through photos.
- The booking path must always be obvious to an approved, onboarded member.

## Auth & Access Control Rules

- Protected pages must use `requireAuth` or `requireApproved` from `src/lib/authGuard.ts`.
- Guard helpers return either a redirect `Response` or user data; always propagate redirects first.
- Status mapping: `PENDING` → `/pending`, `DISABLED` → `/pending?disabled=1`, `APPROVED` → check `onboarding_complete`.
- If `APPROVED` and `onboarding_complete` is not `true` → redirect to `/onboarding`.
- If `APPROVED` and `onboarding_complete` is `true` → redirect to `/member`.
- Descope session cookie name is `DS`.

## Descope Custom Attributes

### `status`

| Value | Meaning |
|---|---|
| `PENDING` | _(default)_ Account created but not yet approved |
| `APPROVED` | User may access the member portal |
| `DISABLED` | User is blocked; shown a disabled message on `/pending` |

### `onboarding_complete`

| Value | Meaning |
|---|---|
| _(unset / false)_ | Must complete onboarding before accessing `/member`, `/schedule`, `/adventure-request` |
| `true` | Onboarding done; full member portal access granted |

## Booking System

The `/schedule` page embeds **two** separate Google Calendar appointment scheduling iframes, displayed as tabs:

- **2-Hour Hike** — env var `GOOGLE_SCHEDULING_EMBED_URL_2HR`
- **4-Hour Hike** — env var `GOOGLE_SCHEDULING_EMBED_URL_4HR`

Availability is controlled by the owner's personal Google Calendar. Each slot is for **one household**. Random group packs are not part of the service.

## Custom Adventure Requests

`/adventure-request` collects requests for unusual bookings (odd dates, extended hikes, multiple dogs, special logistics). Submitting does **not** create a booking — the owner calls the client to schedule manually.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DESCOPE_PROJECT_ID` | ✅ | Descope project ID — used to validate session JWTs |
| `GOOGLE_SCHEDULING_EMBED_URL_2HR` | ✅ | Google Calendar embed `src` for 2-hour hike booking |
| `GOOGLE_SCHEDULING_EMBED_URL_4HR` | ✅ | Google Calendar embed `src` for 4-hour hike booking |
| `DESCOPE_MANAGEMENT_KEY` | optional | Only needed for admin-facing Descope Management API calls |

> **Legacy:** `GOOGLE_SCHEDULING_EMBED_URL` (single embed) is superseded by the two separate URLs above.

## Testing Guidelines

No dedicated automated test suite is configured.
Minimum manual checks per change:

- Authentication flow on `/login` and `/request`.
- Onboarding redirect for newly approved members.
- Access behavior for `/pending`, `/onboarding`, `/member`, and `/schedule` by user status.
- Booking tab switching on `/schedule`.
- Missing-env behavior (e.g. missing `DESCOPE_PROJECT_ID`).

## Commit & Pull Request Guidelines

- Use Conventional Commit style when possible (`feat:`, `fix:`, `chore:`, `docs:`).
- Keep commits focused to one logical change.
- PRs should include: purpose, user-facing impact, manual verification steps, and screenshots for UI changes.
- Call out any environment variable or Vercel configuration changes.

## Security & Architecture Constraints

- Never commit secrets or `.env`.
- Required env vars: `DESCOPE_PROJECT_ID`, `GOOGLE_SCHEDULING_EMBED_URL_2HR`, `GOOGLE_SCHEDULING_EMBED_URL_4HR`.
- Do not add a database dependency; persistent user state remains in Descope custom attributes.
- Do not introduce additional frontend UI frameworks.
- Payment is handled outside the app (Stripe invoices, Venmo, Zelle, or cash) — do not gate bookings on payment.
