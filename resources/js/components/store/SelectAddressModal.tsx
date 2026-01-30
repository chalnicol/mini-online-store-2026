import type React from "react";
import BaseModal from "./BaseModal";
import type { AddressDetails } from "@/types";
import { Circle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface SelectAddressModalProps {
	addresses: AddressDetails[];
	onClose: () => void;
	onSelect: (id: number) => void;
	selected: number;
}

const SelectAddressModal: React.FC<SelectAddressModalProps> = ({
	addresses,
	selected,
	onSelect,
	onClose,
}) => {
	const [selectedAddress, setSelectedAddress] = useState<number>(selected);

	const contRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (contRef.current) {
			gsap.fromTo(
				contRef.current,
				{ scale: 0 },
				{
					scale: 1,
					duration: 0.8,
					ease: "elastic.out(1, 0.5)",
				}
			);
		}
		return () => {
			gsap.killTweensOf(contRef.current);
		};
	}, []);

	return (
		<BaseModal>
			<div
				ref={contRef}
				className="w-full max-w-xl overflow-hidden rounded shadow"
			>
				<p className="bg-sky-900 text-white font-semibold px-3 py-2">
					Select Address
				</p>
				{addresses.length > 0 ? (
					<div className="bg-white p-2 md:p-3">
						<ul className="max-h-[300px] overflow-y-auto">
							{addresses.map((address) => (
								<li
									key={address.id}
									className={`border-t border-gray-300 last:border-b cursor-pointer overflow-hidden  transition-all duration-300 ${
										selectedAddress == address.id
											? "bg-gray-100"
											: "hover:bg-sky-50"
									}`}
									onClick={() => setSelectedAddress(address.id)}
								>
									<div className="flex items-center px-2 py-1 gap-x-2 cursor-pointer">
										<Circle
											size={14}
											className={`text-sky-900 ${
												selectedAddress == address.id
													? "fill-current"
													: ""
											}`}
										/>
										<div className="flex-1 flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-2">
											<div className="flex-1">
												<p className="text-sm">
													{address.fullName}
												</p>
												<div className="flex items-center font-semibold gap-x-2">
													<p className="text-sm text-sky-900">
														{address.contactPerson}
													</p>
													<p className="text-xs border border-gray-400 rounded px-1 text-gray-600">
														{address.contactNumber}
													</p>
												</div>
											</div>
											{address.default == true && (
												<span className="bg-rose-400 text-white font-bold text-xs rounded px-2">
													Default
												</span>
											)}
										</div>
									</div>
								</li>
							))}
						</ul>
						<div className="space-x-1 mt-4">
							<button
								type="button"
								className="border border-gray-400 bg-gray-200 text-gray-600 px-3 py-0.5 rounded font-semibold hover:bg-gray-100 cursor-pointer"
								onClick={onClose}
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={() => onSelect(selectedAddress)}
								className="border bg-sky-900 text-white px-3 py-0.5 rounded font-semibold hover:bg-sky-800 cursor-pointer"
							>
								Select
							</button>
						</div>
					</div>
				) : (
					<p>No addresses found.</p>
				)}
			</div>
		</BaseModal>
	);
};

export default SelectAddressModal;
