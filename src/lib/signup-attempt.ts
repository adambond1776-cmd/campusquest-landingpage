import type { AgeResult } from '@/app/signup/age-actions';
import type { AuthResult, SignUpInput } from '@/lib/auth';
import {
  classifySignupError,
  logSignupFailure,
  userFacingSignupMessage,
} from '@/lib/signup-diagnostics';
import { SIGNUP_NETWORK_TIMEOUT_MS, withTimeout } from '@/lib/timeout';

export type SignupAttemptInput = {
  email: string;
  role: SignUpInput['role'];
  interests: string[];
  plan: SignUpInput['plan'];
  birthYear: number;
  guardianName?: string;
  guardianEmail?: string;
};

export type SignupAttemptDeps = {
  recordAge: (input: {
    email: string;
    birthYear: number;
    guardianName?: string;
    guardianEmail?: string;
  }) => Promise<AgeResult>;
  signUpWithEmail: (input: SignUpInput) => Promise<AuthResult>;
  timeoutMs?: number;
};

/**
 * Serializes age recording then the magic-link request, with a timeout around
 * each network hop so a hung Supabase/email call cannot leave the spinner up.
 */
export async function runSignupAttempt(
  input: SignupAttemptInput,
  deps: SignupAttemptDeps
): Promise<AuthResult> {
  const timeoutMs = deps.timeoutMs ?? SIGNUP_NETWORK_TIMEOUT_MS;

  try {
    const recorded = await withTimeout(
      deps.recordAge({
        email: input.email,
        birthYear: input.birthYear,
        guardianName: input.guardianName,
        guardianEmail: input.guardianEmail,
      }),
      timeoutMs,
      'record_age'
    );

    if (!recorded.ok) return { ok: false, message: recorded.message };

    return await withTimeout(
      deps.signUpWithEmail({
        email: input.email,
        role: input.role,
        interests: input.interests,
        plan: input.plan,
      }),
      timeoutMs,
      'sign_up'
    );
  } catch (error) {
    const kind = classifySignupError(error);
    logSignupFailure({ stage: 'signup_attempt', kind });
    return { ok: false, message: userFacingSignupMessage(kind) };
  }
}

/** Sync lock so the first click wins before React re-renders `submitting`. */
export function createSubmitGate() {
  let busy = false;

  return {
    tryStart(): boolean {
      if (busy) return false;
      busy = true;
      return true;
    },
    finish(): void {
      busy = false;
    },
    get busy(): boolean {
      return busy;
    },
  };
}
