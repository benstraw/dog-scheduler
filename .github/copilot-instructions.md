# Copilot Instructions — Dog Scheduler

## Project overview

Dog Scheduler is a minimal, invite-only scheduling web app for a bespoke dog hiking and walking service. Only manually approved clients can access the Google Calendar scheduling widget. Authentication is handled via [Descope](https://descope.com) (Google, Apple, or Passkeys). There is no database — all user state lives in Descope custom attributes.

## Tech stack

- **[Astro](https://astro.build)** (SSR mode, `output: 'server'`) — all pages are server-rendered
- **[@astrojs/vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/)** — deployment adapter (Vercel)
- **[@descope/node-sdk](https://docs.descope.com/sdk-libraries/backend/nodejs/)** — server-side JWT validation
- **[@descope/web-component](https://docs.descope.com/sdk-libraries/frontend/web-component/)** — client-side login widget (loaded from CDN)
- **TypeScript** — used throughout; strict mode enabled via `tsconfig.json`
- No heavy UI frameworks — plain HTML, minimal CSS, vanilla JS only where needed

## Project structure

```
src/
  components/
    Layout.astro       # Shell layout (header, footer, global styles)
    LoginButton.astro  # Button that navigates to /login
    LogoutButton.astro # Clears DS cookie and redirects to /
  lib/
    authGuard.ts       # requireAuth / requireApproved helpers
    descope.ts         # Descope client singleton, validateSession, getSessionToken
  pages/
    index.astro        # Public landing page
    login.astro        # Descope login widget + post-login redirect logic
    pending.astro      # Awaiting-approval / disabled message (authenticated)
    schedule.astro     # Google Calendar embed (APPROVED only)
    api/               # (future API routes, e.g. session exchange)
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DESCOPE_PROJECT_ID` | ✅ | Descope project ID — used to validate session JWTs server-side |
| `GOOGLE_SCHEDULING_EMBED_URL` | ✅ | Full `src` URL from the Google Calendar appointment scheduling embed |
| `DESCOPE_MANAGEMENT_KEY` | optional | Only needed for admin-facing Descope Management API calls |

Copy `.env.example` to `.env` for local development. On Vercel, set these in **Settings → Environment Variables**.

## Development

```bash
npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:4321)
npm run build      # production build
npm run preview    # preview the production build locally
```

## Routing and access control

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing page with login button |
| `/login` | Public | Descope login widget; handles post-login redirect |
| `/pending` | Authenticated | Awaiting-approval or disabled message |
| `/schedule` | APPROVED only | Google Calendar scheduling embed |

## Auth guard pattern

All protected pages use helpers from `src/lib/authGuard.ts`. The helpers return either a `Response` (redirect) or a `DescopeUserInfo` object. Pages must check and propagate redirects before using the user object:

```ts
import { requireApproved } from '../lib/authGuard';

const result = await requireApproved(Astro);
if (result instanceof Response) return result;   // propagate redirect
const user = result;
```

- `requireAuth` — validates the session; redirects unauthenticated visitors to `/`
- `requireApproved` — additionally checks `user.status === 'APPROVED'`; redirects PENDING → `/pending`, DISABLED → `/pending?disabled=1`

## User status values (Descope custom attribute `status`)

| Value | Meaning |
|---|---|
| `PENDING` | _(default)_ Account created but not yet approved |
| `APPROVED` | User may access `/schedule` |
| `DISABLED` | User is blocked; shown a disabled message on `/pending` |

User approval is managed in the **Descope Console** (User Management → Users → Custom Attributes → `status`).

## Coding conventions

- TypeScript throughout; avoid `any` — use typed interfaces or explicit casts via `Record<string, unknown>`
- Server-side logic lives in `src/lib/`; keep pages thin (import helpers, call guards, render)
- All user-facing text lives in the `.astro` template, not in lib files
- The Descope session cookie is named `DS` (set by the Descope Web Component client-side)
- `import.meta.env.*` for environment variables in Astro; never use `process.env` directly in `.astro` files
- No database — never introduce a database dependency; all persistent state stays in Descope
- No additional UI frameworks — keep the frontend to plain HTML and vanilla JS
