import { ChevronRight } from 'lucide-react';
import type { RICSSection, ConditionRating } from '../types/survey';

interface Props {
  section: RICSSection;
  rating?: ConditionRating;
  isComplete: boolean;
  onClick: () => void;
}

const ratingColors: Record<string, string> = {
  '1': 'bg-green-500 text-white',
  '2': 'bg-amber-500 text-white',
  '3': 'bg-red-500 text-white',
  'NI': 'bg-gray-400 text-white',
};

export default function SectionCard({ section, rating, isComplete, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all active:scale-[0.98] text-left min-h-[64px]"
    >
      {section.hasConditionRating && rating ? (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${ratingColors[String(rating)]}`}>
          {String(rating)}
        </div>
      ) : (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isComplete ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
          <span className="text-xs font-mono">{section.number}</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${isComplete ? 'text-gray-900' : 'text-gray-600'}`}>
          {section.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Section {section.number}
          {isComplete && ' • Complete'}
        </p>
      </div>

      <ChevronRight size={18} className="text-gray-300 shrink-0" />
    </button>
  );
}
