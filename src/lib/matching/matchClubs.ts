import { isInterest, MAX_RESULTS, type Interest } from './interests';
import type { Club, ClubMatch, Matchable, MatchStrength } from './types';

export type MatchOptions = {
  rng?: () => number;
  limit?: number;
};

function shuffleInPlace<T>(items: T[], rng: () => number): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const current = items[i];
    items[i] = items[j];
    items[j] = current;
  }
  return items;
}

export function scoreOverlap(
  buttons: readonly string[],
  selected: readonly string[],
): Interest[] {
  const selectedSet = new Set(selected.filter(isInterest));
  const matched: Interest[] = [];

  for (const button of buttons) {
    if (!isInterest(button) || !selectedSet.has(button)) continue;
    if (!matched.includes(button)) matched.push(button);
  }

  return matched;
}

export function scoreMatchable(
  item: Matchable,
  selected: readonly string[],
): number {
  return scoreOverlap(item.buttons, selected).length;
}

export function matchStrength(score: number): MatchStrength {
  if (score >= 3) return 'strong';
  if (score === 2) return 'good';
  return 'match';
}

export function matchStrengthLabel(score: number): string {
  if (score >= 3) return 'Strong match';
  if (score === 2) return 'Good match';
  return 'Match';
}

/**
 * Score organizations by interest overlap.
 *
 * Events can reuse this later by passing the parent club's buttons:
 * matchClubs([{ name: event.name, buttons: parentClub.buttons }], selected)
 */
export function matchClubs(
  clubs: readonly Club[],
  selected: readonly string[],
  options: MatchOptions = {},
): ClubMatch[] {
  const rng = options.rng ?? Math.random;
  const limit = options.limit ?? MAX_RESULTS;

  if (!Array.isArray(clubs) || limit <= 0) return [];

  const selectedInterests = selected.filter(isInterest);
  if (selectedInterests.length === 0) return [];

  const byScore = new Map<number, ClubMatch[]>();

  for (const club of clubs) {
    if (!club || typeof club.name !== 'string' || club.name.trim() === '') continue;
    if (!Array.isArray(club.buttons)) continue;

    const matchedInterests = scoreOverlap(club.buttons, selectedInterests);
    if (matchedInterests.length === 0) continue;

    const match: ClubMatch = {
      club,
      score: matchedInterests.length,
      matchedInterests,
    };
    const bucket = byScore.get(match.score);
    if (bucket) bucket.push(match);
    else byScore.set(match.score, [match]);
  }

  const ranked: ClubMatch[] = [];
  const scores = [...byScore.keys()].sort((a, b) => b - a);

  for (const score of scores) {
    const tier = byScore.get(score);
    if (!tier) continue;
    ranked.push(...shuffleInPlace(tier, rng));
  }

  const unique: ClubMatch[] = [];
  const seen = new Set<string>();
  for (const match of ranked) {
    if (seen.has(match.club.name)) continue;
    seen.add(match.club.name);
    unique.push(match);
    if (unique.length >= limit) break;
  }

  return unique;
}
