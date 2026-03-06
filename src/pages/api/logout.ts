/**
 * GET|POST /api/logout
 *
 * Clears the Descope session cookie and redirects to the landing page.
 * The Descope Web SDK sets the `DS` cookie; we clear it here on the
 * server side so the user is immediately logged out without relying on
 * client-side JS.
 */
import type { APIRoute } from 'astro';

function logoutResponse() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      // Expire the Descope session cookie
      'Set-Cookie':
        'DS=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
    },
  });
}

export const GET: APIRoute = () => logoutResponse();
export const POST: APIRoute = () => logoutResponse();
