import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock descope module
vi.mock('../../../lib/descope', () => ({
  getSessionToken: vi.fn(),
  validateSession: vi.fn(),
}));

// Mock @descope/node-sdk
const mockUpdateCustomAttribute = vi.fn();
vi.mock('@descope/node-sdk', () => ({
  default: vi.fn(() => ({
    management: {
      user: {
        updateCustomAttribute: mockUpdateCustomAttribute,
      },
    },
  })),
}));

import { getSessionToken, validateSession } from '../../../lib/descope';
import type { DescopeUserInfo } from '../../../lib/descope';

const mockGetSessionToken = vi.mocked(getSessionToken);
const mockValidateSession = vi.mocked(validateSession);

// We need to dynamically import the handler because it reads import.meta.env
// Vitest handles import.meta.env via vi.stubEnv
async function callHandler(request: Request) {
  // Import the module fresh isn't needed since we mock at module level
  const { POST } = await import('../onboarding-complete');
  return POST({ request, url: new URL(request.url) } as any);
}

const approvedUser: DescopeUserInfo = {
  userId: 'user-1',
  email: 'test@example.com',
  approvalStatus: 'APPROVED',
  onboardingComplete: false,
};

const pendingUser: DescopeUserInfo = {
  userId: 'user-2',
  email: 'pending@example.com',
  approvalStatus: 'PENDING',
  onboardingComplete: false,
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('DESCOPE_PROJECT_ID', 'test-project');
  vi.stubEnv('DESCOPE_MANAGEMENT_KEY', 'test-key');
});

describe('POST /api/onboarding-complete', () => {
  it('returns 401 when no session token is present', async () => {
    mockGetSessionToken.mockReturnValue(null);

    const res = await callHandler(new Request('http://localhost/api/onboarding-complete', { method: 'POST' }));

    expect(res.status).toBe(401);
  });

  it('returns 401 when session token is invalid', async () => {
    mockGetSessionToken.mockReturnValue('bad-token');
    mockValidateSession.mockResolvedValue(null);

    const res = await callHandler(new Request('http://localhost/api/onboarding-complete', { method: 'POST' }));

    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not APPROVED', async () => {
    mockGetSessionToken.mockReturnValue('valid-token');
    mockValidateSession.mockResolvedValue(pendingUser);

    const res = await callHandler(new Request('http://localhost/api/onboarding-complete', { method: 'POST' }));

    expect(res.status).toBe(403);
  });

  it('returns 200 and sets onboarding_complete for APPROVED user', async () => {
    mockGetSessionToken.mockReturnValue('valid-token');
    mockValidateSession.mockResolvedValue(approvedUser);
    mockUpdateCustomAttribute.mockResolvedValue(undefined);

    const res = await callHandler(new Request('http://localhost/api/onboarding-complete', { method: 'POST' }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    expect(mockUpdateCustomAttribute).toHaveBeenCalledWith('user-1', 'onboardingComplete', 'true');
  });

  it('returns 500 when Descope management API fails', async () => {
    mockGetSessionToken.mockReturnValue('valid-token');
    mockValidateSession.mockResolvedValue(approvedUser);
    mockUpdateCustomAttribute.mockRejectedValue(new Error('API error'));

    const res = await callHandler(new Request('http://localhost/api/onboarding-complete', { method: 'POST' }));

    expect(res.status).toBe(500);
  });

  it('returns 500 when management key is missing', async () => {
    vi.stubEnv('DESCOPE_MANAGEMENT_KEY', '');
    mockGetSessionToken.mockReturnValue('valid-token');
    mockValidateSession.mockResolvedValue(approvedUser);

    const res = await callHandler(new Request('http://localhost/api/onboarding-complete', { method: 'POST' }));

    expect(res.status).toBe(500);
  });
});
