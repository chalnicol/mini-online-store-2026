import { cn } from '@/lib/utils';
import { Review } from '@/types/store';
import { User } from 'lucide-react';
import Rating from './Rating';

type SizeType = 'sm' | 'md';

interface ReviewCardProps {
    className?: string;
    review: Review;
    size?: SizeType;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
    review,
    size = 'md',
    className,
}) => {
    // console.log(review);
    const cls =
        'border-t border-gray-300 py-1.5 last:border-b even:bg-gray-100';

    const paddingCls: Record<SizeType, string> = {
        sm: 'px-1',
        md: 'px-3',
    };

    return (
        <>
            {size === 'md' && (
                <div
                    className={cn(
                        'space-y-1.5',
                        cls,
                        paddingCls[size],
                        className,
                    )}
                >
                    <div className="flex items-center gap-x-2">
                        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-full border border-gray-400 px-1">
                            <User size={21} />
                        </div>
                        <div className="flex flex-col gap-x-2">
                            <p className="font-semibold">{review.user.name}</p>
                            <p className="text-xs text-slate-400">
                                {review.relativeTime}
                            </p>
                        </div>
                    </div>
                    <Rating rating={review.rating} size="sm" />
                    <p className="text-xs font-semibold text-gray-400">
                        {review.variant.name}
                    </p>
                    <p className="text-sm">{review.comment}</p>
                </div>
            )}
            {size === 'sm' && (
                <div
                    className={cn(
                        'flex items-center gap-x-2',
                        cls,
                        paddingCls[size],
                        className,
                    )}
                >
                    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-white px-1">
                        <User size={21} />
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                            <p className="text-sm font-semibold">
                                {review.user.name}
                            </p>
                            <p className="text-xs text-gray-400">
                                {review.relativeTime}
                            </p>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReviewCard;
