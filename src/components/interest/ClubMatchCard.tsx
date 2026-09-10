import { matchStrengthLabel, type ClubMatch } from '@/lib/matching';

type ClubMatchCardProps = {
  match: ClubMatch;
};

export default function ClubMatchCard({ match }: ClubMatchCardProps) {
  const { club, score, matchedInterests } = match;
  const reason =
    matchedInterests.length === 1
      ? `Matches ${matchedInterests[0]}`
      : `Matches ${matchedInterests.join(' + ')}`;

  return (
    <article className="bg-white rounded-2xl border border-cream-200 shadow-soft p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-100 text-brand-700 text-[11px] font-bold uppercase tracking-wide">
          {matchStrengthLabel(score)}
        </span>
        <span className="text-[11px] font-semibold text-ink/45">
          {score} {score === 1 ? 'interest' : 'interests'} matched
        </span>
      </div>

      <h3 className="text-lg font-bold text-ink leading-snug text-balance">
        {club.name}
      </h3>

      {club.description && (
        <p className="text-sm text-ink/60 leading-relaxed">{club.description}</p>
      )}

      <p className="mt-auto text-sm font-medium text-brand-700">{reason}</p>
    </article>
  );
}
