import { Review } from '@/types/store';
import { User } from 'lucide-react';
import Rating from './Rating';

interface ReviewCardProps {
    className?: string;
    review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, className }) => {
    return (
        <div
            className={`space-y-2 border-t border-gray-300 p-2 last:border-b odd:bg-gray-100 ${className}`}
        >
            <div className="flex items-center gap-x-2">
                <div className="flex aspect-square w-10 items-center justify-center overflow-hidden rounded-full border border-gray-400">
                    <User size={22} />
                </div>
                <div>
                    <p className="font-semibold">{review.user.name}</p>
                    <p className="text-sm">{review.relativeTime}</p>
                </div>
            </div>
            <Rating rating={review.rating} size="sm" />
            <p className="text-sm font-semibold text-gray-400">
                {review.variant.name}
            </p>
            <p>{review.comment}</p>
        </div>
    );
};

export default ReviewCard;
