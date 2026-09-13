'use server';

import { ageStore } from '@/lib/age-store';
import {
  MINIMUM_AGE,
  bracketForBirthYear,
  createConsentToken,
  type GuardianConsent,
} from '@/lib/age';
import { sendGuardianRequest, sendOperatorAlert } from '@/lib/alerts';
import { alertsConfigured } from '@/lib/env';
import { PRIVACY_VERSION, TERMS_VERSION, legalEntity } from '@/lib/legal';
import { isProductionRuntime } from '@/lib/runtime';
import { LOCAL_DEV_ORIGIN, publicOrigin } from '@/lib/site';

export type AgeResult =
  | { ok: true; bracket: 'adult' }
  | { ok: true; bracket: 'minor'; guardianEmailed: boolean }
  | { ok: false; message: string };

/**
 * Records what a student told us about their age, before the magic link goes out.
 *
 * Written at submit time rather than after the account exists, because the store
 * is keyed by email address and the gate has to be in place the first time they
 * sign in. Someone who abandons the sign-up leaves behind a row with a birth
 * year and no account, which the retention job clears.
 */
export async function recordAge(input: {
  email: string;
  birthYear: number;
  guardianName?: string;
  guardianEmail?: string;
}): Promise<AgeResult> {
  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, message: 'We need your email address first.' };

  const bracket = bracketForBirthYear(input.birthYear);

  if (bracket === 'under_16' || bracket === 'unknown') {
    return {
      ok: false,
      message: `CampusQuest is for students aged ${MINIMUM_AGE} and over.`,
    };
  }

  const store = ageStore();

  if (bracket === 'adult') {
    await store.attest(email, input.birthYear);
    return { ok: true, bracket: 'adult' };
  }

  const guardianName = input.guardianName?.trim() ?? '';
  const guardianEmail = input.guardianEmail?.trim().toLowerCase() ?? '';

  if (!guardianName || !guardianEmail) {
    return { ok: false, message: 'We need a parent or guardian to contact.' };
  }

  if (guardianEmail === email) {
    return {
      ok: false,
      message: 'The guardian address has to be different from your own.',
    };
  }

  if (isProductionRuntime() && !alertsConfigured()) {
    return {
      ok: false,
      message:
        'We could not email a parent or guardian right now. Please try again in a few minutes.',
    };
  }

  const origin = publicOrigin() ?? (isProductionRuntime() ? undefined : LOCAL_DEV_ORIGIN);
  if (!origin) {
    return {
      ok: false,
      message:
        'We could not email a parent or guardian right now. Please try again in a few minutes.',
    };
  }

  await store.attest(email, input.birthYear);

  const { token, hash, expiresAt } = createConsentToken();

  const consent: GuardianConsent = {
    guardian_name: guardianName,
    guardian_email: guardianEmail,
    requested_at: new Date().toISOString(),
    consented_at: null,
    token_hash: hash,
    expires_at: expiresAt,
    revoked_at: null,
    terms_version: TERMS_VERSION,
    privacy_version: PRIVACY_VERSION,
  };

  await store.requestGuardian(email, consent);

  const delivery = await sendGuardianRequest({
    guardianEmail,
    guardianName,
    studentEmail: email,
    confirmUrl: `${origin}/guardian/confirm?token=${token}`,
    operator: legalEntity() ?? 'CampusQuest',
  });

  if (!delivery.delivered) {
    await sendOperatorAlert({
      severity: 'action_required',
      subject: 'A guardian consent email did not send',
      body: [
        `Student: ${email}`,
        `Guardian: ${guardianName} <${guardianEmail}>`,
        `Reason: ${delivery.detail}`,
        '',
        'Their account is locked until the guardian follows the link. Send it by hand or',
        'contact the student.',
      ].join('\n'),
    });

    if (isProductionRuntime()) {
      return {
        ok: false,
        message:
          'We could not email that parent or guardian. Check the address and try again, or wait a few minutes.',
      };
    }
  }

  return { ok: true, bracket: 'minor', guardianEmailed: delivery.delivered };
}
