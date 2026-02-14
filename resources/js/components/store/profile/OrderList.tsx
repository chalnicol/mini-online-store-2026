import { Link } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';

const OrderList: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-6 text-center">
            <ShoppingBag size={64} className="mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800">
                No orders found.
            </h2>
            <p className="mb-6 text-gray-500">
                Looks like you haven't made any orders yet.
            </p>
            <Link
                href="/"
                className="rounded-lg bg-sky-900 px-6 py-2 font-semibold text-white hover:bg-sky-800"
            >
                Go Shopping
            </Link>
        </div>
    );
};
export default OrderList;
