import { Link } from '@inertiajs/react';

const OrderList: React.FC = () => {
    return (
        <div className="flex min-h-42 flex-col items-center justify-center gap-2 rounded border-1 border-gray-300 bg-gray-100 shadow">
            <p className="text-lg font-semibold text-gray-400">
                You have no orders yet.
            </p>
            <Link
                href="/"
                className="rounded border bg-sky-900 px-3 py-1 font-semibold text-white"
            >
                Go Shopping
            </Link>
        </div>
    );
};
export default OrderList;
