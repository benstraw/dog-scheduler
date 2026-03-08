# Testing

## Overview

Dog Scheduler uses [Vitest](https://vitest.dev) for unit and integration tests.
The goal is high confidence in the critical auth and routing logic with minimal
maintenance overhead — we test behaviour, not implementation details.

## Running tests

```bash
npm test            # run all tests once
npm run test:watch  # watch mode for local development
```

## Test layers

### Unit tests — `src/lib/__tests__/descope.test.ts`

Pure-function tests for `getSessionToken`.
No network calls, no mocking — just input/output assertions.

Covers:
- No `Cookie` header present → `null`
- Cookie header with no `DS` cookie → `null`
- `DS` cookie present → decoded value returned
- Percent-encoded `DS` values are decoded correctly
- Empty `DS` value → `null`

### Integration tests — `src/lib/__tests__/authGuard.test.ts`

Tests for `requireAuth`, `requireApproved`, and `requireApprovedNotOnboarded` with
the Descope SDK mocked out (`vi.mock('../descope')`). Each test exercises a distinct
auth scenario.

**`requireAuth`**

| Scenario | Expected result |
|---|---|
| No session token | Redirect → `/` |
| Invalid / expired token | Redirect → `/` |
| Valid token | Returns `DescopeUserInfo` |

**`requireApproved`**

| Scenario | Expected result |
|---|---|
| No session token | Redirect → `/` |
| Invalid / expired token | Redirect → `/` |
| `APPROVED` + onboarded user | Returns `DescopeUserInfo` |
| `APPROVED` + not onboarded | Redirect → `/onboarding` |
| `PENDING` user | Redirect → `/pending` |
| `DISABLED` user | Redirect → `/pending?disabled=1` |

**`requireApprovedNotOnboarded`**

| Scenario | Expected result |
|---|---|
| No session token | Redirect → `/` |
| Invalid / expired token | Redirect → `/` |
| `PENDING` user | Redirect → `/pending` |
| `DISABLED` user | Redirect → `/pending?disabled=1` |
| `APPROVED` + already onboarded | Redirect → `/member` |
| `APPROVED` + not onboarded | Returns `DescopeUserInfo` |

### API tests — `src/pages/api/__tests__/onboarding-complete.test.ts`

Tests for `POST /api/onboarding-complete` with Descope SDK and Management API mocked.

| Scenario | Expected result |
|---|---|
| No session token | 401 |
| Invalid session token | 401 |
| User not APPROVED | 403 |
| APPROVED user, valid request | 200, calls `updateCustomAttribute` |
| Descope Management API failure | 500 |
| Missing management key | 500 |

## Test file locations

```
src/
  lib/
    __tests__/
      descope.test.ts         # unit tests for getSessionToken
      authGuard.test.ts        # integration tests for auth guards
  pages/
    api/
      __tests__/
        onboarding-complete.test.ts  # API endpoint tests
```

## What is not tested

| Area | Reason |
|---|---|
| Astro page components | Server-rendered templates; UI smoke tests belong in E2E |
| CSS / styling | No value in automated tests |
| Descope SDK internals | Tested by the SDK itself; we mock at the boundary |
| `validateSession` with a live token | Requires real Descope credentials; covered by manual checks |
| Formspree form submission | External service; tested manually |

## Manual verification checklist

Run these checks before merging auth-related changes:

1. Visit `/` — public homepage loads with navigation.
2. Visit `/about`, `/gallery`, `/request` — public pages render.
3. Visit `/login` — Descope widget loads.
4. Log in with a `PENDING` account → redirected to `/pending`.
5. Log in with a `DISABLED` account → redirected to `/pending?disabled=1`.
6. Log in with an `APPROVED` + not onboarded account → redirected to `/onboarding`.
7. Complete onboarding form → redirected to `/member`.
8. From `/member`, click booking cards → `/schedule` with correct tab selected.
9. Visit `/adventure-request` — form renders and submits.
10. Already-onboarded user visiting `/onboarding` → redirected to `/member`.
11. Access `/member` without a session → redirected to `/`.
12. Remove `DESCOPE_PROJECT_ID` env var → `/login` shows the missing-config message.

## Future layers

When the user base or risk profile grows, consider adding:

- **Playwright smoke tests** for the critical happy-path flows (homepage loads,
  login widget renders, `/schedule` is gated).
