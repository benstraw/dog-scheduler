# Dog Scheduler — Bespoke Dog Adventures

A minimal scheduling web app for a bespoke dog hiking / dog walking service.
Only manually approved clients can access the Google Calendar scheduling widget.
Authentication is handled via [Descope](https://descope.com) (Google, Apple, or Passkeys).

---

## SETUP

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Start the development server
npm run dev
```

## ENVIRONMENT VARIABLES

| Variable | Required | Description |
|---|---|---|
| `DESCOPE_PROJECT_ID` | ✅ | Descope project ID — used to validate session JWTs |
| `GOOGLE_SCHEDULING_EMBED_URL` | ✅ | Full URL from your Google Calendar appointment page (Embed → copy the `src` value) |
| `DESCOPE_MANAGEMENT_KEY` | _(optional)_ | Only needed if you add a future admin UI |

### Local development

Create a `.env` file in the project root (see `.env.example`):

```
DESCOPE_PROJECT_ID=your_descope_project_id_here
GOOGLE_SCHEDULING_EMBED_URL=https://calendar.google.com/calendar/appointments/...
```

### Deploying to Vercel

Environment variables must be added in the **Vercel dashboard** — the `.env` file is only used for local development.

1. Open your project on [vercel.com](https://vercel.com) and go to **Settings → Environment Variables**.
2. Add each required variable:

   | Name | Value |
   |---|---|
   | `DESCOPE_PROJECT_ID` | Your Descope project ID (from [console.descope.com](https://console.descope.com) → Project Settings) |
   | `GOOGLE_SCHEDULING_EMBED_URL` | The `src` URL from your Google Calendar appointment scheduling embed |

3. Set the **Environment** to **Production** (and optionally Preview/Development).
4. Click **Save**, then **redeploy** the project so the new variables take effect.

> **Tip:** If you see "Authentication is not configured yet" after deploying, it means `DESCOPE_PROJECT_ID` is missing or empty in the Vercel environment. Double-check the variable name (no extra spaces), save, and trigger a new deployment.

---

## HOW TO APPROVE USERS

User approval is handled entirely in the **Descope Console** — no custom admin UI is required.

### Steps

1. Open [console.descope.com](https://console.descope.com) and sign in.
2. Navigate to **User Management → Users**.
3. Search for the user you want to approve.
4. Click the user to open their profile.
5. Under **Custom Attributes**, set:
   ```
   status = APPROVED
   ```
6. Save changes.

The user will be granted access to the scheduling page on their next page load / session refresh.

### User status values

| Value | Meaning |
|---|---|
| `PENDING` | _(default)_ Account created but not yet approved |
| `APPROVED` | User may access the `/schedule` page |
| `DISABLED` | User is blocked; sees a disabled message |

### To disable a user

Set `status = DISABLED` in the same Custom Attributes section.

---

## HOW SCHEDULING WORKS

The scheduling page embeds a **Google Calendar appointment scheduling** widget via an `<iframe>`.

1. Open **Google Calendar** → **Other calendars** → click the **+** → **Create new calendar** (or use an existing one).
2. Open the calendar, go to **Settings** → **Appointment schedules** → create a schedule.
3. On the appointment schedule page, click **Booking page** → **Embed**.
4. Copy the `src` URL from the generated `<iframe>` tag.
5. Paste it as the `GOOGLE_SCHEDULING_EMBED_URL` value in your `.env` file.

Bookings are managed entirely through Google Calendar — no custom booking logic is implemented.

---

## ROUTING

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing page with login button |
| `/login` | Public | Descope login widget (Google / Apple / Passkeys) |
| `/pending` | Authenticated | Awaiting-approval or disabled message |
| `/schedule` | APPROVED only | Google Calendar scheduling embed |

---

## ARCHITECTURE

- **[Astro](https://astro.build)** — static-first framework with SSR for guarded routes
- **[Descope](https://descope.com)** — auth & session management (Google, Apple, Passkeys)
- **Google Calendar** — appointment scheduling embed
- No database — all user state lives in Descope custom attributes
- No heavy UI frameworks — plain HTML, minimal CSS, vanilla JS only where needed
