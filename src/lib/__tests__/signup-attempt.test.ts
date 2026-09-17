import { afterEach, describe, expect, it, vi } from 'vitest';
import { SIGNUP_RETRY_MESSAGE } from '@/lib/signup-diagnostics';
import { TimeoutError, withTimeout } from '@/lib/timeout';
import { createSubmitGate, runSignupAttempt } from '@/lib/signup-attempt';

const never = <T,>() => new Promise<T>(() => {});

const baseInput = {
  email: 'student@uri.edu',
  role: 'student' as const,
  interests: ['Sports'],
  plan: 'free' as const,
  birthYear: 2004,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createSubmitGate', () => {
  it('allows only one in-flight attempt until finish() is called', () => {
    const gate = createSubmitGate();
    expect(gate.tryStart()).toBe(true);
    expect(gate.tryStart()).toBe(false);
    expect(gate.tryStart()).toBe(false);
    gate.finish();
    expect(gate.tryStart()).toBe(true);
  });
});

describe('runSignupAttempt', () => {
  it('records age then sends the magic link on success', async () => {
    const recordAge = vi.fn().mockResolvedValue({ ok: true, bracket: 'adult' });
    const signUpWithEmail = vi
      .fn()
      .mockResolvedValue({ ok: true, mock: false, alreadyRegistered: false });

    const result = await runSignupAttempt(baseInput, { recordAge, signUpWithEmail });

    expect(result).toEqual({ ok: true, mock: false, alreadyRegistered: false });
    expect(recordAge).toHaveBeenCalledOnce();
    expect(signUpWithEmail).toHaveBeenCalledOnce();
    expect(signUpWithEmail.mock.invocationCallOrder[0]).toBeGreaterThan(
      recordAge.mock.invocationCallOrder[0]
    );
  });

  it('does not send a magic link when age recording fails', async () => {
    const recordAge = vi.fn().mockResolvedValue({
      ok: false,
      message: 'CampusQuest is for students aged 16 and over.',
    });
    const signUpWithEmail = vi.fn();

    const result = await runSignupAttempt(baseInput, { recordAge, signUpWithEmail });

    expect(result).toEqual({
      ok: false,
      message: 'CampusQuest is for students aged 16 and over.',
    });
    expect(signUpWithEmail).not.toHaveBeenCalled();
  });

  it('turns a thrown age-store failure into an error result instead of hanging', async () => {
    const recordAge = vi.fn().mockRejectedValue(
      new Error('Could not save age: relation "cq_age_records" does not exist')
    );
    const signUpWithEmail = vi.fn();

    const result = await runSignupAttempt(baseInput, { recordAge, signUpWithEmail });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.message).not.toMatch(/cq_age_records|relation/);
    expect(signUpWithEmail).not.toHaveBeenCalled();
  });

  it('times out a hung age write and returns a retry message', async () => {
    const result = await runSignupAttempt(baseInput, {
      recordAge: never,
      signUpWithEmail: vi.fn(),
      timeoutMs: 20,
    });

    expect(result).toEqual({ ok: false, message: SIGNUP_RETRY_MESSAGE });
  });

  it('times out a hung magic-link request after age succeeds', async () => {
    const recordAge = vi.fn().mockResolvedValue({ ok: true, bracket: 'adult' });
    const result = await runSignupAttempt(baseInput, {
      recordAge,
      signUpWithEmail: never,
      timeoutMs: 20,
    });

    expect(recordAge).toHaveBeenCalledOnce();
    expect(result).toEqual({ ok: false, message: SIGNUP_RETRY_MESSAGE });
  });

  it('lets the submit gate block a second attempt until the first finishes', () => {
    const gate = createSubmitGate();
    const signUpWithEmail = vi.fn();

    if (gate.tryStart()) {
      signUpWithEmail();
    }
    if (gate.tryStart()) {
      signUpWithEmail();
    }

    expect(signUpWithEmail).toHaveBeenCalledTimes(1);
    gate.finish();
    if (gate.tryStart()) {
      signUpWithEmail();
    }
    expect(signUpWithEmail).toHaveBeenCalledTimes(2);
  });
});

describe('withTimeout', () => {
  it('rejects with TimeoutError when the promise never settles', async () => {
    await expect(withTimeout(never(), 15, 'test_op')).rejects.toBeInstanceOf(TimeoutError);
  });
});
