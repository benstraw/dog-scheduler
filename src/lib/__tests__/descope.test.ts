import { describe, it, expect } from 'vitest';
import { getSessionToken } from '../descope';

describe('getSessionToken', () => {
  it('returns null when no Cookie header is present', () => {
    const req = new Request('http://localhost/');
    expect(getSessionToken(req)).toBeNull();
  });

  it('returns null when the Cookie header contains no DS cookie', () => {
    const req = new Request('http://localhost/', {
      headers: { cookie: 'other=abc; foo=bar' },
    });
    expect(getSessionToken(req)).toBeNull();
  });

  it('extracts the DS cookie value when present', () => {
    const req = new Request('http://localhost/', {
      headers: { cookie: 'DS=my-session-token' },
    });
    expect(getSessionToken(req)).toBe('my-session-token');
  });

  it('extracts DS when it appears after other cookies', () => {
    const req = new Request('http://localhost/', {
      headers: { cookie: 'foo=bar; DS=token-value; baz=qux' },
    });
    expect(getSessionToken(req)).toBe('token-value');
  });

  it('decodes a percent-encoded DS cookie value', () => {
    const encoded = encodeURIComponent('header.payload.signature');
    const req = new Request('http://localhost/', {
      headers: { cookie: `DS=${encoded}` },
    });
    expect(getSessionToken(req)).toBe('header.payload.signature');
  });

  it('returns null when DS cookie value is empty', () => {
    const req = new Request('http://localhost/', {
      headers: { cookie: 'DS=' },
    });
    expect(getSessionToken(req)).toBeNull();
  });
});
