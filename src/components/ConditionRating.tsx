import type { ConditionRating as ConditionRatingType } from '../types/survey';

interface Props {
  value: ConditionRatingType;
  onChange: (value: ConditionRatingType) => void;
  disabled?: boolean;
}

const ratings: { value: ConditionRatingType; label: string; color: string; description: string }[] = [
  { value: 1, label: '1', color: 'bg-green-500', description: 'No repair needed' },
  { value: 2, label: '2', color: 'bg-amber-500', description: 'Attention needed' },
  { value: 3, label: '3', color: 'bg-red-500', description: 'Urgent repair' },
  { value: 'NI', label: 'NI', color: 'bg-gray-400', description: 'Not inspected' },
];

export default function ConditionRating({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">Condition Rating</label>
      <div className="flex gap-2">
        {ratings.map((r) => (
          <button
            key={String(r.value)}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value === r.value ? null : r.value)}
            className={`flex-1 min-h-[48px] rounded-lg font-bold text-lg transition-all ${
              value === r.value
                ? `${r.color} text-white ring-2 ring-offset-2 ring-gray-400 scale-105`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            title={r.description}
          >
            {r.label}
          </button>
        ))}
      </div>
      {value && (
        <p className="text-xs text-gray-500 mt-1">
          {ratings.find(r => r.value === value)?.description}
        </p>
      )}
    </div>
  );
}
