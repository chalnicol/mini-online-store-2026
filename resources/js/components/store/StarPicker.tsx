import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

const StarPicker = ({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" onClick={() => onChange(star)} className="cursor-pointer" disabled={disabled}>
        <Star
          size={20}
          className={cn('transition-colors', star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')}
        />
      </button>
    ))}
  </div>
);

export default StarPicker;
