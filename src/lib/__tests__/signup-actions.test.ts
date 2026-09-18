import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const recordAge = vi.fn();
const findAuthUserByEmail = vi.fn();
const createPendingAuthUser = vi.fn();
const sendCampusEmailCode = vi.fn();
const verifyCampusEmailCode = vi.fn();
const persistConfigured = vi.fn();
const alertsConfigured = vi.fn();
const isProductionRuntime = vi.fn();
const createAdminClient = vi.fn();
const createClient = vi.fn();

vi.mock('@/app/signup/age-actions', () => ({
  recordAge: (...args: unknown[]) => recordAge(...args),
}));

vi.mock('@/lib/email-verification-service', async () => {
  const actual = await vi.importActual<typeof import('@/lib/email-verification-service')>(
    '@/lib/email-verification-service'
  );
  return {
    ...actual,
    findAuthUserByEmail: (...args: unknown[]) => findAuthUserByEmail(...args),
    createPendingAuthUser: (...args: unknown[]) => createPendingAuthUser(...args),
    sendCampusEmailCode: (...args: unknown[]) => sendCampusEmailCode(...args),
    verifyCampusEmailCode: (...args: unknown[]) => verifyCampusEmailCode(...args),
  };
});

vi.mock('@/lib/env', async () => {
  const actual = await vi.importActual<typeof import('@/lib/env')>('@/lib/env');
  return {
    ...actual,
    persistConfigured: () => persistConfigured(),
    alertsConfigured: () => alertsConfigured(),
  };
});

vi.mock('@/lib/runtime', async () => {
  const actual = await vi.importActual<typeof import('@/lib/runtime')>('@/lib/runtime');
  return {
    ...actual,
    isProductionRuntime: () => isProductionRuntime(),
  };
});

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => createAdminClient(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => createClient(),
}));

const input = {
  email: 'ram@uri.edu',
  role: 'student' as const,
  interests: ['Sports'],
  plan: 'free' as const,
  birthYear: 2004,
};

describe('startCampusSignup', () => {
  beforeEach(() => {
    vi.resetModules();
    recordAge.mockReset();
    findAuthUserByEmail.mockReset();
    createPendingAuthUser.mockReset();
    sendCampusEmailCode.mockReset();
    verifyCampusEmailCode.mockReset();
    persistConfigured.mockReset();
    alertsConfigured.mockReset();
    isProductionRuntime.mockReset();
    createAdminClient.mockReset();
    createClient.mockReset();

    persistConfigured.mockReturnValue(true);
    alertsConfigured.mockReturnValue(true);
    isProductionRuntime.mockReturnValue(true);
    recordAge.mockResolvedValue({ ok: true, bracket: 'adult' });
    findAuthUserByEmail.mockResolvedValue(null);
    createPendingAuthUser.mockResolvedValue({ id: 'user-1' });
    sendCampusEmailCode.mockResolvedValue({
      ok: true,
      emailMasked: 'r••@uri.edu',
      expiresInSeconds: 600,
      resendAvailableInSeconds: 60,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a pending user and only reports success after the code is sent', async () => {
    const { startCampusSignup } = await import('@/app/signup/signup-actions');
    const result = await startCampusSignup(input);

    expect(result).toEqual({
      ok: true,
      mock: false,
      alreadyRegistered: false,
      needsVerification: true,
      emailMasked: 'r••@uri.edu',
    });
    expect(createPendingAuthUser).toHaveBeenCalledWith({
      email: 'ram@uri.edu',
      metadata: { role: 'student', interests: ['Sports'], plan: 'free' },
    });
    expect(sendCampusEmailCode).toHaveBeenCalledWith({ userId: 'user-1', email: 'ram@uri.edu' });
  });

  it('rejects non-URI student emails', async () => {
    const { startCampusSignup } = await import('@/app/signup/signup-actions');
    const result = await startCampusSignup({ ...input, email: 'student@gmail.com' });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.message).toMatch(/URI email/i);
    expect(createPendingAuthUser).not.toHaveBeenCalled();
    expect(sendCampusEmailCode).not.toHaveBeenCalled();
  });

  it('does not block adult signup when age postgres is missing', async () => {
    recordAge.mockResolvedValue({
      ok: false,
      message: "We couldn't complete that. Please try again.",
      kind: 'database',
    });

    const { startCampusSignup } = await import('@/app/signup/signup-actions');
    const result = await startCampusSignup(input);

    expect(result.ok).toBe(true);
    expect(createPendingAuthUser).toHaveBeenCalledOnce();
    expect(sendCampusEmailCode).toHaveBeenCalledOnce();
  });

  it('returns a send failure after creating the pending user, without claiming a code was sent', async () => {
    const { EmailVerificationError } = await import('@/lib/email-verification-service');
    sendCampusEmailCode.mockRejectedValue(
      new EmailVerificationError("We couldn't send your code. Please try again.", 'send_failed')
    );

    const { startCampusSignup } = await import('@/app/signup/signup-actions');
    const result = await startCampusSignup(input);

    expect(result).toEqual({
      ok: false,
      message: "We couldn't send your code. Please try again.",
    });
  });

  it('refuses an already-verified account instead of sending another signup code', async () => {
    findAuthUserByEmail.mockResolvedValue({
      id: 'user-1',
      user_metadata: { campus_email_verified_at: '2026-01-01T00:00:00.000Z' },
    });

    const { startCampusSignup } = await import('@/app/signup/signup-actions');
    const result = await startCampusSignup(input);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.message).toMatch(/already exists/i);
    expect(createPendingAuthUser).not.toHaveBeenCalled();
  });
});
