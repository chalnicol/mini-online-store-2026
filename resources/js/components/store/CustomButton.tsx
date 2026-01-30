import { Loader } from "lucide-react";

type ButtonColor = "primary" | "secondary" | "info" | "danger" | "dark";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface CustomButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children?: React.ReactNode;
	label?: string;
	size?: ButtonSize;
	color?: ButtonColor;
	onClick?: () => void;
	disabled?: boolean;
	loading?: boolean;
	className?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
	children,
	label,
	className,
	size = "md",
	color = "primary",
	disabled,
	loading,
	onClick,
	...props
}) => {
	const btnSizeClass: Record<ButtonSize, string> = {
		xs: "px-2 py-0.5 text-xs",
		sm: "px-2.5 py-0.5 text-sm",
		md: "px-3 py-1",
		lg: "px-3.5 py-1 text-lg",
	};

	const btnClrClass: Record<ButtonColor, string> = {
		primary: "bg-sky-900 hover:bg-sky-800 text-white border border-sky-800",
		secondary:
			"bg-gray-200 hover:bg-gray-100 text-gray-600 border border-gray-400",
		info: "bg-sky-500 hover:bg-sky-400 text-white border border-sky-400",
		danger: "bg-rose-500 hover:bg-rose-400 text-white border border-rose-400",
		dark: "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700",
	};

	const btnClass =
		disabled || loading
			? `${btnSizeClass[size]} border bg-gray-200 border-gray-300 text-gray-400 opacity-90`
			: `${btnSizeClass[size]} ${btnClrClass[color]} cursor-pointer`;

	return (
		<button
			className={`font-semibold shadow rounded  ${btnClass} ${className}`}
			onClick={onClick}
			disabled={disabled || loading}
			{...props}
		>
			{loading ? (
				<div className="flex gap-x-1 items-center justify-center">
					<Loader size={16} className="animate-spin" />
					<p>Processing</p>
				</div>
			) : (
				children || label
			)}
		</button>
	);
};

export default CustomButton;
