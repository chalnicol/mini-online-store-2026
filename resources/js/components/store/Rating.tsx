import React from "react";
import { Star, StarHalf } from "lucide-react";

interface RatingProps {
	rating: number;
	numReviews?: number;
	size?: "sm" | "lg";
	className?: string;
}

const Rating: React.FC<RatingProps> = ({
	rating,
	size,
	numReviews,
	className,
}) => {
	const iconSize = () => {
		switch (size) {
			case "sm":
				return 12;
			case "lg":
				return 20;
			default:
				return 16;
		}
	};
	const hasReviews = numReviews && numReviews > 0;
	const txtString = numReviews && numReviews > 1 ? "reviews" : "review";

	const finalRating =
		Math.floor(rating) === 0 && numReviews === 0 ? 5 : rating;

	return (
		<div className={`flex flex-wrap gap-2 items-center ${className}`}>
			<div className="relative">
				<div className="flex gap-x-0.5">
					{Array.from({ length: 5 }, (_, i) => (
						<Star key={i} size={iconSize()} className="text-gray-300" />
					))}
				</div>
				<div className="absolute top-0 left-0 flex gap-x-0.5">
					{Array.from({ length: Math.ceil(finalRating) }, (_, i) => {
						// Check if the current star is full, half, or empty
						const isFullStar = finalRating >= i + 1;
						const isHalfStar = !isFullStar && finalRating >= i + 0.5;

						return (
							<div key={i} className="text-yellow-500">
								{isFullStar && (
									<Star
										size={iconSize()}
										className="fill-current text-yellow-400"
									/>
								)}
								{isHalfStar && (
									<StarHalf
										size={iconSize()}
										className="fill-current text-yellow-400"
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
			<div className="inline-flex text-xs font-semibold">
				{!!hasReviews ? (
					<span className="bg-gray-100 px-1.5">{`${numReviews} ${txtString}`}</span>
				) : (
					<span>No reviews yet.</span>
				)}
			</div>
		</div>
	);
};

export default Rating;
