import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  canSubmitSelections,
  clubs,
  matchClubs,
  MIN_SELECTIONS,
  type ClubMatch,
  type Interest,
} from '@/lib/matching';
import InterestGrid from './InterestGrid';
import MatchResults from './MatchResults';

export default function InterestMatcher() {
  const headingId = useId();
  const resultsRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Interest[]>([]);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const pendingScroll = useRef<'picker' | 'results' | null>(null);

  const ready = canSubmitSelections(selected);
  const remaining = Math.max(0, MIN_SELECTIONS - selected.length);

  const matches = useMemo<ClubMatch[]>(() => {
    if (!ready) return [];
    return matchClubs(clubs, selected, {
      rng: () => {
        const n = Math.sin(shuffleKey + 1) * 10000;
        return n - Math.floor(n);
      },
    });
  }, [ready, selected, shuffleKey]);

  const toggleInterest = (interest: Interest) => {
    setSelected((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  useEffect(() => {
    const node =
      pendingScroll.current === 'results'
        ? resultsRef.current
        : pendingScroll.current === 'picker'
          ? pickerRef.current
          : null;
    pendingScroll.current = null;
    node?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
  }, [showResults]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmitSelections(selected)) return;
    pendingScroll.current = 'results';
    setShowResults(true);
  };

  return (
    <section
      id="what-are-you-into"
      aria-labelledby={showResults ? undefined : headingId}
      aria-label={showResults ? 'Your CampusQuest matches' : undefined}
      className="py-20 lg:py-28 bg-white"
    >
      <div className="max-w-content mx-auto px-5 sm:px-8">
        {!showResults ? (
          <div ref={pickerRef} className="scroll-mt-24">
            <div className="max-w-2xl mx-auto text-center">
              <span className="eyebrow">See it in action</span>
              <h2
                id={headingId}
                className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink text-balance"
              >
                What are you into?
              </h2>
              <p className="mt-5 text-lg text-ink/60 leading-relaxed">
                Pick 3 or more. We'll match you with clubs and events that fit.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-12 rounded-2xl border border-cream-200 bg-cream-50 p-5 sm:p-8 shadow-soft"
            >
              <InterestGrid selected={selected} onToggle={toggleInterest} />

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p
                  className={`text-sm ${ready ? 'font-semibold text-gold-600' : 'text-ink/50'}`}
                  aria-live="polite"
                >
                  {ready
                    ? 'Ready to discover'
                    : `${selected.length} of ${MIN_SELECTIONS} minimum selected`}
                </p>

                <button
                  type="submit"
                  disabled={!ready}
                  aria-disabled={!ready}
                  className="btn-primary disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none motion-reduce:hover:translate-y-0"
                >
                  Show My Matches
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {!ready && remaining > 0 && (
                <p className="sr-only">
                  Select {remaining} more {remaining === 1 ? 'interest' : 'interests'} to
                  continue.
                </p>
              )}
            </form>
          </div>
        ) : (
          <div ref={resultsRef} tabIndex={-1} className="outline-none scroll-mt-24">
            <MatchResults
              matches={matches}
              selected={selected}
              onChangeInterests={() => {
                pendingScroll.current = 'picker';
                setShowResults(false);
              }}
              onShowDifferent={() => setShuffleKey((value) => value + 1)}
            />
          </div>
        )}
      </div>
    </section>
  );
}
