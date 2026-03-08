# TODO

## Descope Flow: Make phone number optional (no SMS OTP)

The "sign-up-or-in" flow currently has a "User Information - Unverified - Phone Only" screen that requires phone number and triggers SMS OTP verification via the "Verify" button.

**Goal:** Collect phone number optionally without requiring SMS verification.

**Steps:**
1. In Descope Console → Build → Flows → "sign-up-or-in"
2. On the "User Information - Unverified - Phone Only" screen:
   - Click the "Verify" button → switch to **Behavior** tab
   - Change the button action from phone OTP verification to a simple form submit / next step
   - Make the phone number field **optional** (remove the `*` required marker)
3. Save and publish the flow

**Why:** Some users don't have cell phones or don't want to give their number for SMS verification. Email OTP is sufficient for identity verification. Phone can still be collected as optional contact info.

---

## External Service Setup for New Features

### Descope

- [ ] **Create `onboarding_complete` custom attribute** — In Descope Console → Build → User Custom Attributes, add a new attribute named `onboarding_complete` (type: string). This is read from the JWT and set via the Management API.
- [ ] **Add `onboarding_complete` to JWT claims** — Ensure the `onboarding_complete` attribute is included in the session JWT so the server can read it without an extra API call. (Descope Console → Build → JWT Templates or similar)
- [ ] **Verify `DESCOPE_MANAGEMENT_KEY` exists** — In Descope Console → Settings → Management Keys, generate a key if you don't already have one. This is needed for the onboarding-complete and admin-approve endpoints.

### Vercel

- [ ] **Add new environment variables:**
  - `FORMSPREE_ONBOARDING_ID` — Formspree form ID for the onboarding form
  - `FORMSPREE_ADVENTURE_REQUEST_ID` — Formspree form ID (replaces `FORMSPREE_SIDE_QUEST_ID`)
  - `DESCOPE_MANAGEMENT_KEY` — If not already set
- [ ] **Rename environment variable:**
  - `GOOGLE_SCHEDULING_EMBED_URL` → `GOOGLE_SCHEDULING_EMBED_URL_2HR` (code falls back to the old name, but update for clarity)
- [ ] **Remove old environment variable** (optional, after verifying):
  - `FORMSPREE_SIDE_QUEST_ID` — No longer referenced in code

### Formspree

- [ ] **Create onboarding form** — New form for the `/onboarding` page. Fields: address, pickup_instructions, emergency_contact_name, emergency_contact_phone, vet_name, vet_phone, dog_name, dog_breed, dog_age, dog_size, dog_temperament, dog_leash_behavior, dog_medical_notes, _user_email, _user_name. Copy the form ID to `FORMSPREE_ONBOARDING_ID`.
- [ ] **Rename/recreate adventure request form** (optional) — If you want a clean form ID, create a new Formspree form for adventure requests and use that ID as `FORMSPREE_ADVENTURE_REQUEST_ID`. Or just reuse the existing side-quest form ID under the new env var name.

### Content & Images

- [ ] **Replace placeholder SVGs** — Swap `public/images/placeholder-*.svg` and `public/images/gallery/gallery-*.svg` with real photos. Keep filenames the same or update references in `index.astro` and `gallery.astro`.
- [ ] **Review placeholder copy** — Update testimonials in `index.astro` and about page text in `about.astro` with real content.
- [ ] **Update contact email** — Several pages reference `hello@dogadventures.example` (pending.astro, payments.astro). Update to real email address.
