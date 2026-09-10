import { isInterest, type Interest } from './interests';
import type { Club, ParsedClubDataset } from './types';

function asOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseClub(raw: unknown): Club | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const name = asOptionalString(record.name);
  if (!name) return null;
  if (!Array.isArray(record.buttons)) return null;

  const buttons = record.buttons.filter(isInterest);
  const uniqueButtons: Interest[] = [];
  for (const button of buttons) {
    if (!uniqueButtons.includes(button)) uniqueButtons.push(button);
  }

  const club: Club = { name, buttons: uniqueButtons };
  const description = asOptionalString(record.description);
  const url = asOptionalString(record.url);
  const category = asOptionalString(record.category);
  const image = asOptionalString(record.image);

  if (description) club.description = description;
  if (url) club.url = url;
  if (category) club.category = category;
  if (image) club.image = image;

  return club;
}

export function parseClubDataset(raw: unknown): ParsedClubDataset {
  const clubs: Club[] = [];
  const seen = new Set<string>();
  let skippedCount = 0;

  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { clubs?: unknown }).clubs)
      ? ((raw as { clubs: unknown[] }).clubs)
      : null;

  if (!list) {
    return { clubs, loadedCount: 0, skippedCount: 1 };
  }

  for (const item of list) {
    const club = parseClub(item);
    if (!club || seen.has(club.name)) {
      skippedCount += 1;
      continue;
    }
    seen.add(club.name);
    clubs.push(club);
  }

  return { clubs, loadedCount: clubs.length, skippedCount };
}
