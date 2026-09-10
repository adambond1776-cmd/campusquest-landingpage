import { describe, expect, it } from 'vitest';
import { canSubmitSelections, formatInterestList, MIN_SELECTIONS } from './interests';
import { matchClubs, scoreMatchable } from './matchClubs';
import { clubDataset } from './clubs';
import { parseClub, parseClubDataset } from './parseClubs';
import type { Club } from './types';

const clubs: Club[] = [
  { name: 'Alpha', buttons: ['Create', 'Connect'] },
  { name: 'Bravo', buttons: ['Connect', 'Lead', 'Care'] },
  { name: 'Charlie', buttons: ['Play'] },
  { name: 'Delta', buttons: ['Create', 'Connect', 'Grow'] },
  { name: 'Echo', buttons: ['Serve'] },
  { name: 'Foxtrot', buttons: ['Create'] },
  { name: 'Golf', buttons: ['Connect', 'Care'] },
  { name: 'Hotel', buttons: ['Compete'] },
  { name: 'India', buttons: ['Create', 'Play'] },
  { name: 'Juliet', buttons: ['Grow'] },
  { name: 'Kilo', buttons: ['Create', 'Connect'] },
];

function scores(matches: ReturnType<typeof matchClubs>): number[] {
  return matches.map((match) => match.score);
}

describe('canSubmitSelections', () => {
  it('blocks fewer than 3 selections', () => {
    expect(canSubmitSelections([])).toBe(false);
    expect(canSubmitSelections(['Create'])).toBe(false);
    expect(canSubmitSelections(['Create', 'Connect'])).toBe(false);
    expect(MIN_SELECTIONS).toBe(3);
  });

  it('allows 3 to 10 valid interests and ignores junk', () => {
    expect(canSubmitSelections(['Create', 'Connect', 'Grow'])).toBe(true);
    expect(canSubmitSelections(['Create', 'Create', 'Connect', 'not-real'])).toBe(false);
    expect(
      canSubmitSelections([
        'Compete',
        'Create',
        'Lead',
        'Serve',
        'Connect',
        'Explore',
        'Grow',
        'Believe',
        'Play',
        'Care',
      ]),
    ).toBe(true);
  });
});

describe('scoreMatchable', () => {
  it('counts overlapping interests only once', () => {
    expect(
      scoreMatchable(
        { name: 'Bravo', buttons: ['Connect', 'Lead', 'Care'] },
        ['Compete', 'Connect', 'Care'],
      ),
    ).toBe(2);
    expect(
      scoreMatchable(
        { name: 'Dupes', buttons: ['Connect', 'Connect', 'Care'] },
        ['Connect', 'Care'],
      ),
    ).toBe(2);
  });
});

describe('matchClubs', () => {
  const selected = ['Create', 'Connect', 'Care'];

  it('excludes zero-overlap clubs', () => {
    const matches = matchClubs(clubs, selected, { rng: () => 0 });
    expect(matches.some((match) => match.club.name === 'Hotel')).toBe(false);
    expect(matches.every((match) => match.score > 0)).toBe(true);
  });

  it('ranks strongest matches first', () => {
    const matches = matchClubs(clubs, selected, { rng: () => 0 });
    const ranked = scores(matches);
    expect(ranked).toEqual([...ranked].sort((a, b) => b - a));
    expect(matches[0]?.score).toBe(2);
  });

  it('keeps score ranking when equal-score clubs shuffle', () => {
    const low = matchClubs(clubs, selected, { rng: () => 0 });
    const high = matchClubs(clubs, selected, { rng: () => 0.99 });
    expect(scores(low)).toEqual(scores(high));
    expect(low.map((match) => match.club.name)).not.toEqual(
      high.map((match) => match.club.name),
    );
  });

  it('returns at most 10 organizations and no duplicates', () => {
    const matches = matchClubs(clubs, selected, { rng: () => 0.4, limit: 10 });
    expect(matches.length).toBeLessThanOrEqual(10);
    const names = matches.map((match) => match.club.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('fails gracefully on malformed input', () => {
    expect(matchClubs([], selected)).toEqual([]);
    expect(matchClubs(clubs, [])).toEqual([]);
    expect(
      matchClubs(
        [
          { name: '', buttons: ['Create'] },
          { name: 'Ok', buttons: ['Create'] },
          { name: 'Bad', buttons: undefined as unknown as Club['buttons'] },
        ],
        ['Create', 'Connect', 'Grow'],
      ),
    ).toEqual([
      expect.objectContaining({ club: expect.objectContaining({ name: 'Ok' }), score: 1 }),
    ]);
  });
});

describe('parseClubDataset', () => {
  it('skips unknown shapes and duplicate names', () => {
    const parsed = parseClubDataset({
      clubs: [
        { name: 'Real Club', buttons: ['Create', 'Nope'] },
        { name: 'Real Club', buttons: ['Play'] },
        null,
        { buttons: ['Create'] },
        'nope',
      ],
    });

    expect(parsed.loadedCount).toBe(1);
    expect(parsed.skippedCount).toBe(4);
    expect(parseClub(parsed.clubs[0])).toEqual(parsed.clubs[0]);
    expect(parsed.clubs[0]?.buttons).toEqual(['Create']);
  });

  it('returns empty results when the payload is not a club list', () => {
    expect(parseClubDataset(null).loadedCount).toBe(0);
    expect(parseClubDataset({}).loadedCount).toBe(0);
  });
});

describe('club dataset', () => {
  it('loads the real URI organizations without inventing extras', () => {
    expect(clubDataset.loadedCount).toBe(109);
    expect(clubDataset.clubs).toHaveLength(109);
    expect(clubDataset.clubs.every((club) => club.name && club.buttons)).toBe(true);
  });
});

describe('formatInterestList', () => {
  it('uses readable conjunctions', () => {
    expect(formatInterestList(['Create'])).toBe('Create');
    expect(formatInterestList(['Create', 'Connect'])).toBe('Create and Connect');
    expect(formatInterestList(['Create', 'Connect', 'Grow'])).toBe(
      'Create, Connect, and Grow',
    );
  });
});
