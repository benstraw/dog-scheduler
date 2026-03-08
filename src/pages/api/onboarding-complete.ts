/**
 * POST /api/onboarding-complete
 *
 * Sets `onboarding_complete` to "true" in Descope for the authenticated user.
 * Called by client-side JS after the Formspree onboarding form submission succeeds.
 */
import type { APIRoute } from 'astro';
import DescopeClient from '@descope/node-sdk';
import { getSessionToken, validateSession } from '../../lib/descope';

export const POST: APIRoute = async ({ request }) => {
  const sessionToken = getSessionToken(request);
  if (!sessionToken) {
    // 461 = no DS cookie found
    return new Response('No session token', { status: 461 });
  }

  const user = await validateSession(sessionToken);
  if (!user) {
    // 462 = token present but validation failed
    return new Response('Session invalid', { status: 462 });
  }

  if (user.approvalStatus !== 'APPROVED') {
    // 463 = user not APPROVED (status: <actual>)
    return new Response(`Not approved: ${user.approvalStatus}`, { status: 463 });
  }

  const projectId = import.meta.env.DESCOPE_PROJECT_ID;
  const managementKey = import.meta.env.DESCOPE_MANAGEMENT_KEY;

  if (!projectId || !managementKey) {
    console.error('[onboarding-complete] Missing DESCOPE_PROJECT_ID or DESCOPE_MANAGEMENT_KEY');
    return new Response('Server misconfigured', { status: 500 });
  }

  try {
    const descope = DescopeClient({ projectId, managementKey });
    await descope.management.user.updateCustomAttribute(user.userId, 'onboardingComplete', 'true');

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[onboarding-complete] Failed:', err instanceof Error ? err.message : String(err));
    return new Response('Failed to update onboarding status', { status: 500 });
  }
};
