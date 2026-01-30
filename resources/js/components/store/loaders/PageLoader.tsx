import { Loader } from "lucide-react";
import BaseModal from "../BaseModal";

interface PageLoaderProps {
	caption?: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}
const PageLoader: React.FC<PageLoaderProps> = ({
	caption,
	size = "md",
	className,
}) => {
	const finalCaption = caption || "Loading Page...";

	const txtClass: Record<string, string> = {
		sm: "text-sm",
		md: "text-md",
		lg: "text-lg",
	};

	const loaderClass: Record<string, number> = {
		sm: 16,
		md: 20,
		lg: 24,
	};

	return (
		<BaseModal>
			<div
				className={`max-w-sm bg-white rounded px-4 py-3 flex gap-x-2 items-center justify-center shadow-lg ${className}`}
			>
				<Loader size={loaderClass[size]} className="animate-spin" />
				<p className={`font-bold text-gray-600 ${txtClass[size]}`}>
					{finalCaption}
				</p>
			</div>
		</BaseModal>
	);
};

export default PageLoader;
