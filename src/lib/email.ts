/**
 * email.ts
 *
 * Resend-based email helpers for signup notifications.
 *
 * Two emails are sent when a new user signs up:
 *  1. A welcome/pending-approval email to the new user.
 *  2. An admin notification email to the site owner.
 */

import { Resend } from 'resend';

const FROM_ADDRESS = 'noreply@dogs.benstrawbridge.com';
const ADMIN_EMAIL = 'ben@benstrawbridge.com';
const DESCOPE_USERS_URL = 'https://app.descope.com/users';
const APP_URL = import.meta.env.PUBLIC_APP_URL || 'https://dog-scheduler.vercel.app';

function getResendClient(): Resend {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('[email] RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

/**
 * Send a welcome email to a newly signed-up user letting them know
 * their account is pending approval.
 */
export async function sendUserPendingEmail(userEmail: string, userName?: string): Promise<void> {
  const resend = getResendClient();
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: userEmail,
    subject: 'Welcome — Your account is pending approval',
    html: `
      <p>${greeting}</p>
      <p>Thanks for signing up for Dog Adventures! 🐾</p>
      <p>Your account is currently <strong>pending approval</strong>. We review all new accounts personally and will be in touch soon.</p>
      <p>Once approved, you'll be able to log in and schedule your dog adventures.</p>
      <p>If you have any questions in the meantime, feel free to reach out at <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a>.</p>
      <p>Talk soon,<br>Ben</p>
    `,
  });
}

/**
 * Send an admin notification email when a new user signs up and needs approval.
 */
export async function sendAdminNewUserEmail(userEmail: string, userName?: string, userId?: string): Promise<void> {
  const resend = getResendClient();
  const displayName = userName ? `${userName} (${userEmail})` : userEmail;

  const adminSecret = import.meta.env.ADMIN_APPROVE_SECRET;
  const approveLink = userId && adminSecret
    ? `${APP_URL}/api/admin/approve?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(adminSecret)}`
    : null;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: ADMIN_EMAIL,
    subject: 'New user signed up — approval needed',
    html: `
      <p>A new user has signed up and is pending approval:</p>
      <p><strong>${displayName}</strong></p>
      ${approveLink ? `<p><a href="${approveLink}">Approve this user →</a></p>` : ''}
      <p><a href="${DESCOPE_USERS_URL}">Review users in the Descope Console →</a></p>
    `,
  });
}
