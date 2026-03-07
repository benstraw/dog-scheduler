/**
 * GET /api/admin/approve?userId=xxx&token=xxx
 *
 * Approves a pending user by setting their Descope custom attribute
 * `status` to APPROVED. Protected by a shared secret token so only
 * the admin email link can trigger it.
 */
import type { APIRoute } from 'astro';
import DescopeClient from '@descope/node-sdk';

export const GET: APIRoute = async ({ url }) => {
  const userId = url.searchParams.get('userId');
  const token = url.searchParams.get('token');
  const adminSecret = import.meta.env.ADMIN_APPROVE_SECRET;

  if (!adminSecret || token !== adminSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!userId) {
    return new Response('Missing userId', { status: 400 });
  }

  try {
    const projectId = import.meta.env.DESCOPE_PROJECT_ID;
    const managementKey = import.meta.env.DESCOPE_MANAGEMENT_KEY;

    if (!projectId || !managementKey) {
      console.error('[admin/approve] Missing DESCOPE_PROJECT_ID or DESCOPE_MANAGEMENT_KEY');
      return new Response('Server misconfigured', { status: 500 });
    }

    const descope = DescopeClient({ projectId, managementKey });
    await descope.management.user.updateCustomAttribute(userId, 'status', 'APPROVED');

    return new Response(
      `<html>
        <head><title>User Approved</title></head>
        <body style="font-family:system-ui;max-width:480px;margin:4rem auto;text-align:center;">
          <h1>User Approved</h1>
          <p>The user has been approved and can now log in.</p>
        </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } },
    );
  } catch (err) {
    console.error('[admin/approve] Failed:', err instanceof Error ? err.message : String(err));
    return new Response('Failed to approve user', { status: 500 });
  }
};
