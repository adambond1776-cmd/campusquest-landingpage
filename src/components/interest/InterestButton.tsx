import { Check } from 'lucide-react';
import type { Interest } from '@/lib/matching';

type InterestButtonProps = {
  interest: Interest;
  selected: boolean;
  onToggle: (interest: Interest) => void;
};

export default function InterestButton({
  interest,
  selected,
  onToggle,
}: InterestButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(interest)}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold whitespace-nowrap border transition-all duration-200 focus-visible:ring-offset-white ${
        selected
          ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
          : 'bg-cream-50 text-ink border-cream-300 hover:border-brand-300 hover:bg-white motion-safe:hover:-translate-y-0.5'
      }`}
    >
      {selected && (
        <Check className="h-4 w-4 shrink-0" strokeWidth={2.75} aria-hidden="true" />
      )}
      {interest}
    </button>
  );
}
