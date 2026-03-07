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

Tests for `requireAuth` and `requireApproved` with the Descope SDK mocked out
(`vi.mock('../descope')`).  Each test exercises a distinct auth scenario.

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
| `APPROVED` user | Returns `DescopeUserInfo` |
| `PENDING` user | Redirect → `/pending` |
| `DISABLED` user | Redirect → `/pending?disabled=1` |

## Test file locations

```
src/
  lib/
    __tests__/
      descope.test.ts     # unit tests for getSessionToken
      authGuard.test.ts   # integration tests for requireAuth / requireApproved
```

## What is not tested

| Area | Reason |
|---|---|
| Astro page components | Server-rendered templates; UI smoke tests belong in E2E |
| CSS / styling | No value in automated tests |
| Descope SDK internals | Tested by the SDK itself; we mock at the boundary |
| `validateSession` with a live token | Requires real Descope credentials; covered by manual checks |

## Manual verification checklist

Run these checks before merging auth-related changes:

1. Visit `/login` — Descope widget loads.
2. Log in with a `PENDING` account → redirected to `/pending`.
3. Log in with a `DISABLED` account → redirected to `/pending?disabled=1`.
4. Log in with an `APPROVED` account → redirected to `/schedule`.
5. Access `/schedule` without a session → redirected to `/`.
6. Remove `DESCOPE_PROJECT_ID` env var → `/login` shows the missing-config message.

## Future layers

When the user base or risk profile grows, consider adding:

- **Playwright smoke tests** for the critical happy-path flows (homepage loads,
  login widget renders, `/schedule` is gated).
- **API route tests** for any future `src/pages/api/` endpoints.
