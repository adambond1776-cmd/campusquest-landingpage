import type { Interest } from './interests';

/**
 * Anything CampusQuest can score against selected interests.
 * Clubs use their own tags. Future events can pass the parent
 * organization's buttons here and reuse the same overlap scoring.
 */
export type Matchable = {
  name: string;
  buttons: readonly string[];
};

export type Club = {
  name: string;
  buttons: Interest[];
  description?: string;
  url?: string;
  category?: string;
  image?: string;
};

export type ClubMatch = {
  club: Club;
  score: number;
  matchedInterests: Interest[];
};

export type MatchStrength = 'strong' | 'good' | 'match';

export type ParsedClubDataset = {
  clubs: Club[];
  loadedCount: number;
  skippedCount: number;
};
