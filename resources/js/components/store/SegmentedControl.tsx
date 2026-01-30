import { Check, Circle } from "lucide-react";

interface SegmentedControlProps<T extends string> {
	options: readonly T[] | T[];
	value: T;
	onChange: (newValue: T) => void;
}

const SegmentedControl = <T extends string>({
	options,
	value,
	onChange,
}: SegmentedControlProps<T>) => {
	return (
		<div className="flex text-sm">
			{options.map((option, index) => {
				const isActive = value === option;
				const isFirst = index === 0;
				const isLast = index === options.length - 1;

				return (
					<button
						key={option}
						type="button"
						className={`px-3 py-1 font-semibold flex items-center gap-x-1 border border-gray-400 transition-colors
              ${isFirst ? "rounded-l" : ""} 
              ${isLast ? "rounded-r" : ""}
              ${!isLast ? "border-e-0" : ""}
              ${
						isActive
							? "bg-sky-900 text-white"
							: "bg-gray-200 hover:bg-gray-100 cursor-pointer shadow-md"
					}`}
						onClick={() => onChange(option)}
						disabled={isActive}
					>
						{isActive ? <Check size={14} /> : <Circle size={14} />}
						<span className="capitalize">{option.toLowerCase()}</span>
					</button>
				);
			})}
		</div>
	);
};

export default SegmentedControl;
