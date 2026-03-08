import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DescopeUserInfo } from '../descope';

// Mock the descope module so tests don't require a real Descope project
vi.mock('../descope', () => ({
  getSessionToken: vi.fn(),
  validateSession: vi.fn(),
}));

import { getSessionToken, validateSession } from '../descope';
import { requireAuth, requireApproved } from '../authGuard';

const mockGetSessionToken = vi.mocked(getSessionToken);
const mockValidateSession = vi.mocked(validateSession);

/** Minimal stand-in for AstroGlobal used by the guard helpers. */
function makeMockAstro() {
  return {
    request: new Request('http://localhost/'),
    redirect: (url: string) => Response.redirect(`http://localhost${url}`, 302),
  } as Parameters<typeof requireAuth>[0];
}

const approvedUser: DescopeUserInfo = {
  userId: 'user-1',
  email: 'test@example.com',
  approvalStatus: 'APPROVED',
};

const pendingUser: DescopeUserInfo = {
  userId: 'user-2',
  email: 'pending@example.com',
  approvalStatus: 'PENDING',
};

const disabledUser: DescopeUserInfo = {
  userId: 'user-3',
  email: 'disabled@example.com',
  approvalStatus: 'DISABLED',
};

beforeEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// requireAuth
// ---------------------------------------------------------------------------

describe('requireAuth', () => {
  it('redirects to / when no session token is present', async () => {
    mockGetSessionToken.mockReturnValue(null);

    const result = await requireAuth(makeMockAstro());

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('location')).toBe('http://localhost/');
  });

  it('redirects to / when the session token is invalid', async () => {
    mockGetSessionToken.mockReturnValue('bad-token');
    mockValidateSession.mockResolvedValue(null);

    const result = await requireAuth(makeMockAstro());

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('location')).toBe('http://localhost/');
  });

  it('returns the user info when the session token is valid', async () => {
    mockGetSessionToken.mockReturnValue('valid-token');
    mockValidateSession.mockResolvedValue(approvedUser);

    const result = await requireAuth(makeMockAstro());

    expect(result).not.toBeInstanceOf(Response);
    expect(result).toEqual(approvedUser);
  });
});

// ---------------------------------------------------------------------------
// requireApproved
// ---------------------------------------------------------------------------

describe('requireApproved', () => {
  it('redirects to / when no session token is present', async () => {
    mockGetSessionToken.mockReturnValue(null);

    const result = await requireApproved(makeMockAstro());

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('location')).toBe('http://localhost/');
  });

  it('redirects to / when the session token is invalid', async () => {
    mockGetSessionToken.mockReturnValue('bad-token');
    mockValidateSession.mockResolvedValue(null);

    const result = await requireApproved(makeMockAstro());

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('location')).toBe('http://localhost/');
  });

  it('returns the user info when the user is APPROVED', async () => {
    mockGetSessionToken.mockReturnValue('valid-token');
    mockValidateSession.mockResolvedValue(approvedUser);

    const result = await requireApproved(makeMockAstro());

    expect(result).not.toBeInstanceOf(Response);
    expect(result).toEqual(approvedUser);
  });

  it('redirects to /pending when the user is PENDING', async () => {
    mockGetSessionToken.mockReturnValue('valid-token');
    mockValidateSession.mockResolvedValue(pendingUser);

    const result = await requireApproved(makeMockAstro());

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('location')).toBe('http://localhost/pending');
  });

  it('redirects to /pending?disabled=1 when the user is DISABLED', async () => {
    mockGetSessionToken.mockReturnValue('valid-token');
    mockValidateSession.mockResolvedValue(disabledUser);

    const result = await requireApproved(makeMockAstro());

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('location')).toBe(
      'http://localhost/pending?disabled=1'
    );
  });
});
