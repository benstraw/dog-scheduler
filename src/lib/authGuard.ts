/**
 * authGuard.ts
 *
 * Reusable route-guard helpers for Astro server-rendered pages.
 *
 * Usage inside an Astro page frontmatter:
 *
 *   import { requireAuth, requireApproved } from '../lib/authGuard';
 *
 *   const result = await requireAuth(Astro);
 *   if (result instanceof Response) return result;   // propagate redirect
 *   const user = result;
 *
 *   const result2 = await requireApproved(Astro);
 *   if (result2 instanceof Response) return result2; // propagate redirect
 *   const user2 = result2;
 */

import type { AstroGlobal } from 'astro';
import { getSessionToken, validateSession } from './descope';
import type { DescopeUserInfo } from './descope';

/**
 * Ensure the request carries a valid Descope session.
 *
 * Returns either:
 *  - a `Response` (redirect) that the page must `return` immediately, or
 *  - the authenticated `DescopeUserInfo`
 */
export async function requireAuth(
  astro: AstroGlobal
): Promise<DescopeUserInfo | Response> {
  const token = getSessionToken(astro.request);
  if (!token) {
    return astro.redirect('/');
  }

  const user = await validateSession(token);
  if (!user) {
    return astro.redirect('/');
  }

  return user;
}

/**
 * Ensure the request carries a valid session AND that the user's
 * status is APPROVED.
 *
 * Returns either:
 *  - a `Response` (redirect) that the page must `return` immediately, or
 *  - the authenticated `DescopeUserInfo` (guaranteed status === 'APPROVED')
 *
 * Redirect targets:
 *  - Unauthenticated         → /
 *  - PENDING                 → /pending
 *  - DISABLED                → /pending?disabled=1
 *  - APPROVED                → returns DescopeUserInfo
 */
export async function requireApproved(
  astro: AstroGlobal
): Promise<DescopeUserInfo | Response> {
  const token = getSessionToken(astro.request);
  if (!token) {
    return astro.redirect('/');
  }

  const user = await validateSession(token);
  if (!user) {
    return astro.redirect('/');
  }

  if (user.status === 'DISABLED') {
    return astro.redirect('/pending?disabled=1');
  }

  if (user.status !== 'APPROVED') {
    return astro.redirect('/pending');
  }

  return user;
}
