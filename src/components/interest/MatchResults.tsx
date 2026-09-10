import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { formatInterestList, type ClubMatch, type Interest } from '@/lib/matching';
import ClubMatchCard from './ClubMatchCard';

type MatchResultsProps = {
  matches: ClubMatch[];
  selected: readonly Interest[];
  onChangeInterests: () => void;
  onShowDifferent: () => void;
};

export default function MatchResults({
  matches,
  selected,
  onChangeInterests,
  onShowDifferent,
}: MatchResultsProps) {
  return (
    <div className="animate-fade-up">
      <div className="max-w-2xl">
        <span className="eyebrow">Your matches</span>
        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink text-balance">
          Your CampusQuest matches
        </h2>
        <p className="mt-4 text-lg text-ink/60 leading-relaxed">
          {`Based on ${formatInterestList(selected)}.`}
        </p>
      </div>

      {matches.length === 0 ? (
        <p className="mt-10 text-sm text-ink/60">
          No organizations overlapped with those interests in the current URI list.
        </p>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {matches.map((match) => (
            <ClubMatchCard key={match.club.name} match={match} />
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onChangeInterests} className="btn-secondary">
          Change interests
        </button>
        <button type="button" onClick={onShowDifferent} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          Show different matches
        </button>
      </div>

      <div className="mt-12 rounded-2xl border border-cream-200 bg-cream-50 p-7 sm:p-8">
        <h3 className="text-xl sm:text-2xl font-extrabold text-ink text-balance">
          Want CampusQuest to keep finding things for you?
        </h3>
        <p className="mt-3 text-sm sm:text-base text-ink/60 leading-relaxed max-w-xl">
          This is a preview. The app keeps matching clubs and events to you
          every week.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link to="/signup" className="btn-primary">
            Get the app
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#students" className="btn-secondary">
            Explore more
          </a>
        </div>
      </div>
    </div>
  );
}
