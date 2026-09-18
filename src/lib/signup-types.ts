import type { Plan, Role } from '@/lib/auth';

export type SignupStartInput = {
  email: string;
  role: Role;
  interests: string[];
  plan: Plan;
  birthYear: number;
  guardianName?: string;
  guardianEmail?: string;
};

export type SignupStartResult =
  | {
      ok: true;
      mock: boolean;
      alreadyRegistered: boolean;
      needsVerification: boolean;
      emailMasked: string;
    }
  | { ok: false; message: string };

export type VerifyCodeResult = { ok: true } | { ok: false; message: string };
