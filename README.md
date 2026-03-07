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
| `RESEND_API_KEY` | ✅ | Resend API key — used to send signup notification emails |
| `PUBLIC_APP_URL` | ✅ | Publicly accessible base URL of the app (e.g. `https://dog-scheduler.vercel.app`) — used to generate the one-click approve link in admin emails |
| `ADMIN_APPROVE_SECRET` | ✅ | A secret token that protects the `/api/admin/approve` endpoint — include a long random string |
| `GOOGLE_SCHEDULING_EMBED_URL_4HR` | _(optional)_ | Alternate Google Calendar embed URL for 4-hour adventure bookings |
| `FORMSPREE_SIDE_QUEST_ID` | _(optional)_ | Formspree form ID for the Side Quest request form (e.g. `mgoneqkg`) |
| `DESCOPE_MANAGEMENT_KEY` | _(optional)_ | Only needed if using the Descope Management API (e.g. programmatic user management) |

### Local development

Create a `.env` file in the project root (see `.env.example`):

```
DESCOPE_PROJECT_ID=your_descope_project_id_here
GOOGLE_SCHEDULING_EMBED_URL=https://calendar.google.com/calendar/appointments/...
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
PUBLIC_APP_URL=https://your-app.vercel.app
ADMIN_APPROVE_SECRET=some_long_random_secret
FORMSPREE_SIDE_QUEST_ID=your_formspree_form_id
```

### Deploying to Vercel

Environment variables must be added in the **Vercel dashboard** — the `.env` file is only used for local development.

1. Open your project on [vercel.com](https://vercel.com) and go to **Settings → Environment Variables**.
2. Add each required variable:

   | Name | Value |
   |---|---|
   | `DESCOPE_PROJECT_ID` | Your Descope project ID (from [console.descope.com](https://console.descope.com) → Project Settings) |
   | `GOOGLE_SCHEDULING_EMBED_URL` | The `src` URL from your Google Calendar appointment scheduling embed |
   | `RESEND_API_KEY` | Your Resend API key (from [resend.com](https://resend.com) → API Keys) |
   | `PUBLIC_APP_URL` | Your production URL, e.g. `https://dog-scheduler.vercel.app` |
   | `ADMIN_APPROVE_SECRET` | A long random string used to secure the one-click approve link |

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

### One-click approval via email

When a new user signs up, the app automatically sends you an admin notification email that includes a one-click **Approve this user →** link. Clicking the link calls `GET /api/admin/approve?userId=…&token=…` and sets the user's `approvalStatus` to `APPROVED` in Descope — no console login needed.

The link is secured by the `ADMIN_APPROVE_SECRET` environment variable. If that variable is not set, the approve endpoint will always return `401` and the link will not appear in the email.

---

## EMAIL NOTIFICATIONS (RESEND)

The app uses [Resend](https://resend.com) to send two transactional emails whenever a new user signs up:

1. **Welcome / pending-approval email** — sent to the new user to let them know their account is under review.
2. **Admin notification email** — sent to the site owner with the new user's name and email, plus a one-click approve link.

### How to set up Resend

1. Create a free account at [resend.com](https://resend.com).
2. Go to **Domains** and add your sending domain (e.g. `dogs.yourdomain.com`). Add the required DNS records to your DNS provider.
3. Once the domain is verified, go to **API Keys** → **Create API Key**.
4. Copy the key and set it as `RESEND_API_KEY` in your `.env` file (and in Vercel → Environment Variables for production).
5. The `FROM_ADDRESS` is currently hard-coded in `src/lib/email.ts`. Update it to match your verified sending domain (e.g. `noreply@yourdomain.com`) before deploying.

### How to set up the one-click approve link

1. Generate a long random secret string (at least 32 bytes — e.g. `openssl rand -hex 32` produces 64 hex characters).
2. Set it as `ADMIN_APPROVE_SECRET` in your `.env` and in Vercel.
3. Set `PUBLIC_APP_URL` to the publicly accessible base URL of your deployed app (e.g. `https://dog-scheduler.vercel.app`).
4. Make sure `DESCOPE_MANAGEMENT_KEY` is also set — the approve endpoint uses it to update the user's `approvalStatus` via the Descope Management API.

### Email flow summary

```
New user signs up on /login
  → client POSTs to /api/notify/signup
  → server validates session (user must be PENDING)
  → Resend sends welcome email to the user
  → Resend sends admin notification email with one-click approve link
Admin clicks approve link in email
  → GET /api/admin/approve?userId=…&token=…
  → server verifies token matches ADMIN_APPROVE_SECRET
  → Descope sets approvalStatus = APPROVED for the user
```

---

## SIDE-QUEST FORM (FORMSPREE)

The `/side-quest` page offers approved users a custom adventure request form. Form submissions are handled by [Formspree](https://formspree.io) — no server-side form processing is needed.

### How to set up Formspree

1. Create a free account at [formspree.io](https://formspree.io).
2. Create a new form and copy the form ID from the form's endpoint URL (e.g. `https://formspree.io/f/mgoneqkg` → ID is `mgoneqkg`).
3. Set `FORMSPREE_SIDE_QUEST_ID` to your form ID in `.env` and in Vercel.
4. Configure Formspree to email you on each submission (enabled by default).

If `FORMSPREE_SIDE_QUEST_ID` is not set, the `/side-quest` page shows a placeholder message instead of the form.

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
| `/side-quest` | APPROVED only | Custom adventure request form (Formspree) |
| `/payments` | APPROVED only | Payment information page |
| `POST /api/notify/signup` | Authenticated | Sends signup notification emails via Resend |
| `GET /api/admin/approve` | Secret token | One-click user approval endpoint |

---

## ARCHITECTURE

- **[Astro](https://astro.build)** — static-first framework with SSR for guarded routes
- **[Descope](https://descope.com)** — auth & session management (Google, Apple, Passkeys)
- **[Resend](https://resend.com)** — transactional email (signup notifications, one-click approval)
- **[Formspree](https://formspree.io)** — side-quest adventure request form submissions
- **Google Calendar** — appointment scheduling embed
- No database — all user state lives in Descope custom attributes
- No heavy UI frameworks — plain HTML, minimal CSS, vanilla JS only where needed
