import { User } from "lucide-react";
import Rating from "./Rating";

interface CommentCardProps {
	className?: string;
}

const CommentCard: React.FC<CommentCardProps> = ({ className }) => {
	return (
		<div className={`space-y-2 ${className}`}>
			<div className="flex items-center gap-x-2">
				<div className="w-10 aspect-square rounded-full overflow-hidden flex items-center justify-center border border-gray-300">
					<User size={22} />
				</div>
				<div>
					<p className="font-semibold">John Doe</p>
					<p className="text-sm">12-10-2025</p>
				</div>
			</div>
			<Rating rating={4.5} size="sm" />
			<p className="text-sm text-gray-400 font-semibold">Variant 1</p>
			<p>This is the comment..</p>
		</div>
	);
};

export default CommentCard;
