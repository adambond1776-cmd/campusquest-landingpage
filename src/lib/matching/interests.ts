export const INTERESTS = [
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
] as const;

export type Interest = (typeof INTERESTS)[number];

export const INTEREST_SET = new Set<string>(INTERESTS);

export const MIN_SELECTIONS = 3;
export const MAX_SELECTIONS = 10;
export const MIN_RESULTS = 5;
export const MAX_RESULTS = 10;

export function isInterest(value: unknown): value is Interest {
  return typeof value === 'string' && INTEREST_SET.has(value);
}

export function canSubmitSelections(selected: readonly string[]): boolean {
  const unique = new Set(selected.filter(isInterest));
  return unique.size >= MIN_SELECTIONS && unique.size <= MAX_SELECTIONS;
}

export function formatInterestList(selected: readonly string[]): string {
  const items = selected.filter(isInterest);
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
