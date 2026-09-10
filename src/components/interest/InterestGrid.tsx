import { INTERESTS, type Interest } from '@/lib/matching';
import InterestButton from './InterestButton';

type InterestGridProps = {
  selected: readonly Interest[];
  onToggle: (interest: Interest) => void;
};

export default function InterestGrid({ selected, onToggle }: InterestGridProps) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      role="group"
      aria-label="Campus interests"
    >
      {INTERESTS.map((interest) => (
        <InterestButton
          key={interest}
          interest={interest}
          selected={selected.includes(interest)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
