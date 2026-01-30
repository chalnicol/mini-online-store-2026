import React, { useState } from 'react';
// import { CartContext } from "../contexts/CartContext";
import type { CartItem } from '@/types/store';
import { Link, Trash } from 'lucide-react';

interface CartItemProps {
    item: CartItem;
    className?: string;
}

const CartItemCard: React.FC<CartItemProps> = ({ item, className }) => {
    // const cartContext = useContext(CartContext);

    // if (!cartContext) {
    // 	return null;
    // }

    // const { removeFromCart, updateQuantity } = cartContext;

    const { id, name, image, price, quantity, product, checked } = item;

    const [newQuantity, setNewQuantity] = useState(quantity);

    const updateQuantity = (type: 'increment' | 'decrement') => {
        if (type == 'increment') {
            setNewQuantity((prev) => prev + 1);
        } else if (type == 'decrement') {
            setNewQuantity((prev) => (prev > 1 ? prev - 1 : prev));
        }
    };

    const handleSelectItem = (id: number) => {
        console.log(id);
    };

    const itemName: string = product.variants.length > 1 ? product.name : name;
    const variantName: string | null =
        product.variants.length > 1 ? name : null;

    // const productHasMultipleVariants = product.variants.length > 1;

    return (
        <div className={`p-2 ${className}`}>
            <div className="flex items-start gap-2">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleSelectItem(id)}
                    className="aspect-square w-4"
                />
                <div className="grid flex-1 grid-cols-[1fr_1fr_max-content] items-center gap-x-4 gap-y-3 lg:grid-cols-[2fr_1fr_1fr_max-content]">
                    {/* image & name */}
                    <Link
                        href="/products/1"
                        className="col-span-3 flex gap-x-2 lg:col-span-1"
                    >
                        <img
                            src={image}
                            alt={name}
                            className="aspect-square h-16"
                        />
                        <div>
                            <h3 className="font-bold">{itemName}</h3>
                            {variantName && (
                                <span className="text-sm font-semibold text-gray-500">
                                    {variantName}
                                </span>
                            )}
                        </div>
                    </Link>

                    {/* price & remove button */}
                    <div>
                        <p className="text-xs">Price:</p>
                        <p className="text-sm">
                            ₱
                            <span className="text-xl font-semibold">
                                {price.toLocaleString()}
                            </span>
                        </p>
                        {/* <button className="flex gap-x-1 items-center text-red-400 hover:text-red-600 cursor-pointer">
							<Trash size={16} />
							<span className="text-xs font-semibold">REMOVE</span>
						</button> */}
                    </div>

                    {/* quantity */}
                    <div className="space-y-0.5">
                        <p className="text-xs">Quantity:</p>
                        <div className="flex text-sm">
                            <button
                                className="cursor-pointer rounded-l bg-gray-300 px-3 py-1 hover:bg-gray-400"
                                onClick={() => updateQuantity('decrement')}
                            >
                                -
                            </button>
                            <input
                                type="text"
                                value={newQuantity}
                                onChange={(e) =>
                                    setNewQuantity(Number(e.target.value))
                                }
                                className="w-12 border-t border-b border-gray-400 text-center focus:outline-none"
                            />
                            <button
                                className="cursor-pointer rounded-r bg-gray-300 px-3 py-1 hover:bg-gray-400"
                                onClick={() => updateQuantity('increment')}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button className="flex aspect-square w-7 cursor-pointer items-center justify-center rounded border bg-rose-400 text-white hover:bg-rose-300 hover:shadow-md">
                        <Trash size={16} />
                    </button>
                </div>

                {/* <div>
				<button onClick={() => updateQuantity(id, quantity + 1)}>+</button>
				<button onClick={() => updateQuantity(id, quantity - 1)}>-</button>
				<button onClick={() => removeFromCart(id)}>Remove</button>
			</div> */}
            </div>
        </div>
    );
};

export default CartItemCard;
