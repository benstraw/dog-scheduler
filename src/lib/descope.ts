/**
 * descope.ts
 *
 * Server-side helper for validating Descope session tokens and reading
 * user custom attributes.  Uses the official @descope/node-sdk for
 * proper JWT validation against Descope's cached JWKS public keys.
 *
 * Session cookie name: DS (set by the Descope Web Component on the client).
 */

import DescopeClient from '@descope/node-sdk';

export type UserStatus = 'PENDING' | 'APPROVED' | 'DISABLED';

export interface DescopeUserInfo {
  userId: string;
  email?: string;
  name?: string;
  phone?: string;
  approvalStatus: UserStatus;
  onboardingComplete: boolean;
}

// Singleton Descope client (created lazily once per process)
let _client: ReturnType<typeof DescopeClient> | null = null;

function getClient(): ReturnType<typeof DescopeClient> {
  if (!_client) {
    const projectId = import.meta.env.DESCOPE_PROJECT_ID;
    if (!projectId) {
      throw new Error('[descope] DESCOPE_PROJECT_ID is not configured');
    }
    _client = DescopeClient({ projectId });
  }
  return _client;
}

/**
 * Validate a Descope session token (JWT) using the Node SDK.
 * Returns the decoded user info or null when the token is invalid / expired.
 */
export async function validateSession(
  sessionToken: string
): Promise<DescopeUserInfo | null> {
  try {
    const client = getClient();
    const authInfo = await client.validateSession(sessionToken);

    if (!authInfo?.token?.sub) return null;

    const token = authInfo.token as Record<string, unknown>;
    const rawStatus = token?.['approvalStatus'];
    const rawOnboarding = token?.['onboardingComplete'];

    const status = normalizeStatus(rawStatus);

    return {
      userId: authInfo.token.sub,
      email: token['email'] as string | undefined,
      name: token['name'] as string | undefined,
      phone: token['phone'] as string | undefined,
      approvalStatus: status,
      onboardingComplete: rawOnboarding === 'true' || rawOnboarding === true,
    };
  } catch (err) {
    console.error('[descope] session validation failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

/**
 * Extract the Descope session token (DS cookie) from a request.
 */
export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('cookie') ?? '';
  // Descope sets a cookie named "DS" by default
  const match = cookie.match(/(?:^|;\s*)DS=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Coerce an arbitrary custom-attribute value into a typed UserStatus.
 * Defaults to PENDING when the attribute is missing or unrecognised.
 */
function normalizeStatus(raw: unknown): UserStatus {
  if (raw === 'APPROVED') return 'APPROVED';
  if (raw === 'DISABLED') return 'DISABLED';
  return 'PENDING';
}
