import rawDataset from '@/data/club_tag_map.json';
import { parseClubDataset } from './parseClubs';

export const clubDataset = parseClubDataset(rawDataset);
export const clubs = clubDataset.clubs;
