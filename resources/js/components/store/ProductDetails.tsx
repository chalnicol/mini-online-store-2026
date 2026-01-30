import type { Product } from "@/types";
import { formatPrice } from "@/utils/PriceUtils";
import { useState } from "react";
import Rating from "./Rating";

interface ProductDetailsProps {
	product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
	const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
	const [quantity, setQuantity] = useState<number>(1);

	// 1. Get unique options
	const availableColors = [...new Set(product.variants.map((v) => v.color))];
	const availableSizes = [...new Set(product.variants.map((v) => v.size))];

	// 2. State management (assuming React)
	const [selectedColor, setSelectedColor] = useState(availableColors[0]);
	const [selectedSize, setSelectedSize] = useState(availableSizes[0]);

	// 3. Find the active variant
	const activeVariant = product.variants.find(
		(v) => v.color === selectedColor && v.size === selectedSize
	);

	const getDisplayName = () => {
		if (!product) return "Loading...";
		if (product.variants.length < 2) {
			return `${product.name} (${product.variants[0]?.name})`;
		}
		return product.name;
	};

	const handleQuantityChange = (type: "increment" | "decrement") => {
		setQuantity((prev) =>
			type === "increment" ? prev + 1 : prev > 1 ? prev - 1 : 1
		);
	};

	return (
		<div className="flex flex-col md:flex-row mt-4 mb-6 gap-x-4 gap-y-4">
			<div className="w-full md:max-w-xs lg:max-w-sm flex flex-col">
				<div className="flex-1 w-full bg-gray-100 rounded overflow-hidden border border-gray-300">
					<img
						src={product.variants[selectedVariantIndex].image}
						alt={product.variants[selectedVariantIndex].name}
						className="w-full h-full object-contain max-w-sm object-contain m-auto"
					/>
				</div>
				{/* variant images */}
				{product.variants.length > 1 && (
					<div className="flex gap-x-1.5 mt-2">
						{product.variants.map((variant, i) => (
							<button
								key={variant.id}
								className={`w-11 bg-gray-100 aspect-square border border-gray-300 shadow-sm hover:border-gray-400 cursor-pointer rounded overflow-hidden ${
									i === selectedVariantIndex ? "border-sky-900" : ""
								}`}
								onClick={() => setSelectedVariantIndex(i)}
							>
								{variant.id}
							</button>
						))}
					</div>
				)}
			</div>
			<div className="flex-1 space-y-4">
				<div>
					<h2 className="font-semibold text-lg md:text-xl lg:text-2xl xl:text-3xl">
						{/* {product.name} */}
						{getDisplayName()}
					</h2>
					<p className="text-gray-600 font-medium">
						{product.description}
					</p>
				</div>
				<p className="text-2xl font-bold text-red-700">
					{formatPrice(product.variants[selectedVariantIndex].price)}
				</p>
				<Rating rating={product.averageRating} numReviews={0} />
				{/* variant selector */}
				{/* {product.variants.length > 1 && (
					<div className="flex flex-wrap gap-2">
						<div className="flex-none w-24 text-sm">Select Variant: </div>
						<div className="space-y-1.5 text-sm">
							<div className="font-semibold text-gray-600">
								{product.variants[selectedVariantIndex].name}
							</div>
							<div className="flex flex-wrap gap-1.5">
								{product.variants.map((variant, i) => (
									<button
										key={variant.id}
										className="border border-gray-300 shadow-sm w-11 aspect-square rounded cursor-pointer hover:border-gray-400 bg-gray-100"
										onClick={() => setSelectedVariantIndex(i)}
									>
										<img
											src={variant.image}
											alt={variant.name}
											className="w-full h-full object-contain"
										/>
									</button>
								))}
							</div>
						</div>
					</div>
				)} */}

				{availableColors.length > 1 && (
					<div className="flex flex-wrap gap-2">
						<div className="flex-none w-24 text-sm">Select Color: </div>
						<div className="flex flex-wrap gap-1.5">
							{availableColors.map((color, i) => (
								<button
									key={i}
									className={`border font-semibold text-sm px-2 rounded ${
										selectedColor === color
											? "bg-gray-100 border-sky-900"
											: "border-gray-300 hover:border-sky-900 cursor-pointer shadow"
									}`}
									onClick={() => setSelectedColor(color)}
								>
									{color}
								</button>
							))}
						</div>
					</div>
				)}

				{availableSizes.length > 1 && (
					<div className="flex flex-wrap gap-2">
						<div className="flex-none w-24 text-sm">Select Size: </div>

						<div className="flex flex-wrap gap-1.5">
							{availableSizes.map((size, i) => (
								<button
									key={i}
									className={`border font-semibold text-sm px-2 rounded ${
										selectedSize === size
											? "bg-gray-100 border-sky-900"
											: "border-gray-300 hover:border-sky-900 cursor-pointer shadow"
									}`}
									onClick={() => setSelectedSize(size)}
								>
									{size}
								</button>
							))}
						</div>
					</div>
				)}

				{activeVariant && (
					<div className="flex flex-wrap gap-2">
						<div className="flex-none w-24 text-sm">Active Variant</div>
						<p className="text-sm font-bold text-gray-600 border border-gray-300 rounded shadow px-2">
							{activeVariant.name}
						</p>
					</div>
				)}

				{/* quantity set */}
				<div className="flex flex-wrap gap-	2">
					<div className="flex-none w-24 text-sm">Quantity: </div>
					<div className="space-y-0.5">
						<div className="flex">
							<button
								className="bg-gray-300 px-3 py-1 rounded-l hover:bg-gray-400 cursor-pointer"
								onClick={() => handleQuantityChange("decrement")}
							>
								-
							</button>
							<input
								type="text"
								value={quantity}
								className="w-16 text-center border-t border-b border-gray-400 focus:outline-none"
								onChange={(e) => setQuantity(Number(e.target.value))}
								min={1}
								max={product.variants[selectedVariantIndex].stock}
								disabled={
									product.variants[selectedVariantIndex].stock === 0
								}
							/>
							<button
								className="bg-gray-300 px-3 py-1 rounded-r hover:bg-gray-400 cursor-pointer"
								onClick={() => handleQuantityChange("increment")}
							>
								+
							</button>
						</div>
						{product.variants[selectedVariantIndex].stock === 0 && (
							<span className="text-sm text-rose-500">
								The product is out-of-stock
							</span>
						)}
					</div>
				</div>

				{/* buy now and add to cart buttons */}
				<div className="flex gap-x-2">
					<button className="bg-rose-500 font-bold text-white px-4 py-1 text-lg rounded hover:bg-rose-400 cursor-pointer flex-1 w-full md:flex-none md:w-1/3">
						Buy Now
					</button>
					<button className="bg-sky-900 font-bold text-white px-4 py-1 text-lg rounded hover:bg-sky-800 cursor-pointer flex-1 w-full md:flex-none md:w-1/3">
						Add to Cart
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProductDetails;
