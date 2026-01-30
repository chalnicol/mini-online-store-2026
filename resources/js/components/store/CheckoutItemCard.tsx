import { Trash } from "lucide-react";
import type { CheckoutItem } from "../types";

interface CheckoutItemCardProps {
	item: CheckoutItem;
	onDelete: (id: string) => void;
}
const CheckoutItemCard: React.FC<CheckoutItemCardProps> = ({
	item,
	onDelete,
}) => {
	return (
		<div className="grid grid-cols-[minmax(0,150px)_minmax(0,100px)_1fr_max-content] lg:grid-cols-[4fr_1fr_minmax(0,100px)_1fr_max-content] items-center gap-x-2.5 gap-y-2 odd:bg-gray-100 px-3 py-2 border-t border-gray-300 last:border-b">
			<div className="col-span-4 lg:col-span-1 flex gap-x-2">
				<img
					src={item.imageUrl}
					alt={item.name}
					className="w-12 aspect-square border border-gray-300"
				/>
				<div>
					<p className="font-semibold text-gray-800">{item.name}</p>
					{item.variant && (
						<p className="text-sm font-semibold text-gray-400">
							{item.variant}
						</p>
					)}
				</div>
			</div>
			<div className="text-sm">
				₱<span className="text-lg font-semibold">{item.price}</span>
			</div>
			<div className="font-semibold">x {item.quantity}</div>

			<div className="text-sm text-orange-700">
				₱
				<span className="text-lg font-bold">
					{item.price * item.quantity}
				</span>
			</div>
			<button
				className="w-6 aspect-square bg-rose-400 hover:bg-rose-400 hover:shadow-md border rounded flex items-center justify-center text-white  cursor-pointer"
				onClick={() => onDelete(item.id)}
			>
				<Trash size={16} />
			</button>
		</div>
	);
};

export default CheckoutItemCard;
