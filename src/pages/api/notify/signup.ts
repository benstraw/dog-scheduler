/**
 * POST /api/notify/signup
 *
 * Sends two emails when a new user signs up:
 *  1. A welcome / pending-approval email to the new user.
 *  2. An admin notification email to the site owner.
 *
 * The caller must supply a valid Descope session cookie (DS) so we can
 * verify the request is from a PENDING user before sending emails.
 * No request body is required — all user data is read from the session token.
 */
import type { APIRoute } from 'astro';
import { getSessionToken, validateSession } from '../../../lib/descope';
import { sendAdminNewUserEmail, sendUserPendingEmail } from '../../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  // Verify the caller has a valid session
  const token = getSessionToken(request);
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await validateSession(token);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Only send notification emails for PENDING users
  if (user.status !== 'PENDING') {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userEmail = user.email;
  if (!userEmail) {
    return new Response(JSON.stringify({ error: 'No email address on account' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await Promise.all([
      sendUserPendingEmail(userEmail, user.name),
      sendAdminNewUserEmail(userEmail, user.name),
    ]);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[notify/signup] Failed to send emails:', err instanceof Error ? err.message : String(err));
    return new Response(JSON.stringify({ error: 'Failed to send notification emails' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
