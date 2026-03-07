# Copilot Instructions — Dog Adventure Scheduler

## Project overview

Dog Scheduler is a **private membership adventure service for dogs** — bespoke hikes and outdoor outings for a curated, invite-only client base in West LA, Venice, Playa Vista, Marina del Rey, and El Segundo (west of the 405). The site qualifies the right clients, funnels them through a membership request and approval process, then gets them booking hikes. The north-star metric is **completed hikes**.

The system has three user-facing layers:
1. **Public site** — qualifies prospective clients and drives membership requests
2. **Member onboarding** — collects owner and dog info after approval
3. **Member portal** — enables approved, onboarded members to book hikes

Authentication is handled via [Descope](https://descope.com) (Google, Apple, or Passkeys). There is no database — all user state lives in Descope custom attributes.

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
    Layout.astro            # Shell layout (header, footer, global styles)
    LoginButton.astro       # Button that navigates to /login
    LogoutButton.astro      # Clears DS cookie and redirects to /
  lib/
    authGuard.ts            # requireAuth / requireApproved helpers
    descope.ts              # Descope client singleton, validateSession, getSessionToken
  pages/
    index.astro             # Public homepage (hero, trust photos, testimonials, about preview)
    about.astro             # About page (background, philosophy, adventure logistics)
    gallery.astro           # Photo gallery (emotional trust signals)
    request.astro           # Membership request — Descope sign-up, status → PENDING
    login.astro             # Member login — Descope widget + post-login redirect
    pending.astro           # Awaiting-approval / disabled message (authenticated)
    onboarding.astro        # Member onboarding — owner info + dog profile (APPROVED only)
    member.astro            # Member Home — book hike, upcoming bookings, profile links
    schedule.astro          # Booking page — tabs for 2-hour/4-hour hike (APPROVED + onboarded)
    adventure-request.astro # Custom Adventure Request form (APPROVED + onboarded)
    api/                    # API routes (e.g. session exchange, adventure request submission)
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DESCOPE_PROJECT_ID` | ✅ | Descope project ID — used to validate session JWTs server-side |
| `GOOGLE_SCHEDULING_EMBED_URL_2HR` | ✅ | Google Calendar appointment embed `src` URL for 2-hour hikes |
| `GOOGLE_SCHEDULING_EMBED_URL_4HR` | ✅ | Google Calendar appointment embed `src` URL for 4-hour hikes |
| `DESCOPE_MANAGEMENT_KEY` | optional | Only needed for admin-facing Descope Management API calls |

> **Legacy:** `GOOGLE_SCHEDULING_EMBED_URL` (single embed) is superseded by the two separate embed URLs above. Update `.env.example` and Vercel environment variables accordingly.

Copy `.env.example` to `.env` for local development. On Vercel, set these in **Settings → Environment Variables**.

## Development

```bash
npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:4321)
npm run build      # production build
npm run preview    # preview the production build locally
```

## Routing and access control

### Public site (Attractor / Informer / Converter)

| Path | Access | Page type | Description |
|---|---|---|---|
| `/` | Public | Attractor | Homepage — hero, trust photos, testimonials, about preview |
| `/about` | Public | Informer | About — background, philosophy, adventure logistics |
| `/gallery` | Public | Informer | Photo gallery — dogs on trails, emotional trust signals |
| `/request` | Public | Converter | Membership request — Descope sign-up, status set to `PENDING` |
| `/login` | Public | — | Member login — Descope widget + post-login redirect |

### Member portal (Support / Converter)

| Path | Access | Page type | Description |
|---|---|---|---|
| `/pending` | Authenticated | Support | Awaiting-approval or disabled message |
| `/onboarding` | APPROVED only | Support | Owner info + dog profile (required before booking) |
| `/member` | APPROVED + onboarded | Support | Member Home — book hike, upcoming bookings, profile links |
| `/schedule` | APPROVED + onboarded | Converter | Booking — tabbed 2-hour and 4-hour Google Calendar embeds |
| `/adventure-request` | APPROVED + onboarded | Support | Custom Adventure Request form |

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
- After approval, first login should redirect to `/onboarding` if the `onboarding_complete` attribute is not `true`

## User status values (Descope custom attributes)

### `status`

| Value | Meaning |
|---|---|
| `PENDING` | _(default)_ Account created but not yet approved |
| `APPROVED` | User may access the member portal |
| `DISABLED` | User is blocked; shown a disabled message on `/pending` |

### `onboarding_complete`

| Value | Meaning |
|---|---|
| _(unset / false)_ | Onboarding not yet completed; redirect to `/onboarding` after approval |
| `true` | Onboarding done; user may access `/member`, `/schedule`, `/adventure-request` |

User approval and attribute management is done in the **Descope Console** (User Management → Users → Custom Attributes).

## Booking system

The booking page (`/schedule`) uses **Google Calendar appointment scheduling** embedded in an `<iframe>`. Two separate booking systems exist:

- **2-Hour Hike** — `GOOGLE_SCHEDULING_EMBED_URL_2HR`
- **4-Hour Hike** — `GOOGLE_SCHEDULING_EMBED_URL_4HR`

These are presented as **tabs** on the `/schedule` page. Availability is driven by the owner's personal Google Calendar — personal events automatically block time slots.

Each booking slot represents **one household**. Multiple dogs may attend only if they are from the same household or a known friend. Random group packs are not part of the service.

## Custom Adventure Requests

`/adventure-request` is a form for unusual requests (odd dates, extended hikes, multiple dogs, special logistics). Submitting this form does **not** create a booking. It notifies the owner, who then calls the client to schedule manually.

## Member onboarding fields

After approval, members must complete onboarding before accessing the booking pages.

**Owner info:** address, pickup instructions, emergency contact, veterinarian

**Dog info:** dog name, breed, age, size, temperament, leash behavior, medical notes

Store completed onboarding data as Descope custom attributes and set `onboarding_complete = true`.

## Payment model

Payment is flexible — reducing friction increases completed hikes:

- Stripe Invoice (card)
- Venmo
- Zelle
- Cash

Stripe is the structured option but is not required. Do not gate bookings on payment method.

## Coding conventions

- TypeScript throughout; avoid `any` — use typed interfaces or explicit casts via `Record<string, unknown>`
- Server-side logic lives in `src/lib/`; keep pages thin (import helpers, call guards, render)
- All user-facing text lives in the `.astro` template, not in lib files
- The Descope session cookie is named `DS` (set by the Descope Web Component client-side)
- `import.meta.env.*` for environment variables in Astro; never use `process.env` directly in `.astro` files
- No database — never introduce a database dependency; all persistent state stays in Descope
- No additional UI frameworks — keep the frontend to plain HTML and vanilla JS
- Navigation order: Home · About · Request Membership · Member Login
- Tone: calm, trust-driven; minimal marketing language; strong visual proof through photos
- The booking path must always be obvious to an approved, onboarded member
