import Pagination from '@/components/store/Pagination';
import ProfileLayout from '@/layouts/profile/layout';
import { cn } from '@/lib/utils';
import { OrderReturn, PaginatedResponse } from '@/types/store';
import { Link, router } from '@inertiajs/react';
import { PackageX } from 'lucide-react';
import { useState } from 'react';

interface Filters {
    search: string;
    status: string;
}

interface ReturnsProps {
    returns: PaginatedResponse<OrderReturn>;
    filters: Filters;
}

type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'received' | 'completed' | 'cancelled';

const statusConfig: Record<ReturnStatus, { label: string; className: string }> = {
    pending:   { label: 'Pending',   className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    approved:  { label: 'Approved',  className: 'bg-blue-100 text-blue-700 border-blue-300' },
    rejected:  { label: 'Rejected',  className: 'bg-rose-100 text-rose-700 border-rose-300' },
    received:  { label: 'Received',  className: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600 border-gray-300' },
};

const Returns = ({ returns, filters }: ReturnsProps) => {
    const { data: items, meta } = returns;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        router.get(
            '/profile/returns',
            { search, status },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get('/profile/returns', {}, { preserveState: true });
    };

    const handleCancel = (returnId: number) => {
        if (!confirm('Cancel this return request?')) return;
        setLoading(true);
        router.post(
            `/profile/returns/${returnId}/cancel`,
            {},
            { onFinish: () => setLoading(false) },
        );
    };

    return (
        <div className="space-y-4">
            <div className="border-b border-gray-400 py-1">
                <h2 className="text-lg font-bold text-gray-900">My Returns</h2>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <input
                    type="text"
                    placeholder="Search by return # or order #..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
                >
                    <option value="">All Statuses</option>
                    {Object.entries(statusConfig).map(([value, { label }]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                <button
                    onClick={handleSearch}
                    className="rounded bg-sky-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-sky-800"
                >
                    Search
                </button>
                <button
                    onClick={handleReset}
                    className="rounded border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                    Reset
                </button>
            </div>

            {/* List */}
            {items.length > 0 ? (
                <div className="space-y-2">
                    {items.map((ret) => {
                        const status = statusConfig[ret.status as ReturnStatus];
                        return (
                            <div
                                key={ret.id}
                                className="overflow-hidden rounded border border-gray-300 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-2 p-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-gray-800">
                                            {ret.returnNumber}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Order:{' '}
                                            <Link
                                                href={`/profile/orders/${ret.orderId}`}
                                                className="font-semibold text-sky-700 hover:underline"
                                            >
                                                {ret.orderNumber}
                                            </Link>
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {ret.items?.length ?? 0} item(s) ·{' '}
                                            {ret.items?.[0]?.productName}
                                            {(ret.items?.length ?? 0) > 1 &&
                                                ` +${(ret.items?.length ?? 1) - 1} more`}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={cn(
                                            'rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                            status.className,
                                        )}>
                                            {status.label}
                                        </span>
                                        {ret.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancel(ret.id)}
                                                disabled={loading}
                                                className="text-xs font-semibold text-rose-500 hover:text-rose-700 disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {ret.adminNote && (
                                    <div className="border-t border-gray-100 bg-amber-50 px-3 py-2">
                                        <p className="text-xs font-semibold text-amber-700">
                                            Admin Note: {ret.adminNote}
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-between border-t border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-semibold tracking-widest text-gray-500">
                                    <p>{ret.returnNumber}</p>
                                    <p>{ret.createdAt}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <PackageX size={64} className="mb-4 text-gray-300" />
                    <h2 className="text-2xl font-bold text-gray-800">No returns found.</h2>
                    <p className="text-gray-500">You haven't made any return requests yet.</p>
                </div>
            )}

            <Pagination meta={meta} type="advanced" />
        </div>
    );
};

Returns.layout = (page: React.ReactNode) => <ProfileLayout>{page}</ProfileLayout>;

export default Returns;
