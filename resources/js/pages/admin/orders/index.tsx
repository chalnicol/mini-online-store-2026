import OrdersFiltersModal from '@/components/store/OrdersFiltersModal';
import Pagination from '@/components/store/Pagination';
import useDebounce from '@/hooks/use-debounce'; // add this import
import AdminLayout from '@/layouts/admin/layout';
import { cn } from '@/lib/utils';
import { OrderDetails, OrderStatus, PaginatedResponse } from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Link, router } from '@inertiajs/react';
import { ListFilter, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Filters {
  search: string;
  status: string;
  date_from: string;
  date_to: string;
}

interface OrdersProps {
  orders: PaginatedResponse<OrderDetails>;
  orderFilters: Filters;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700 border-blue-300' },
  shipped: { label: 'Shipped', className: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  delivered: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-100 text-rose-700 border-rose-300' },
  returned: { label: 'Returned', className: 'bg-gray-100 text-gray-600 border-gray-300' },
};

const Orders = ({ orders, orderFilters: filters }: OrdersProps) => {
  const { data: items, meta } = orders;

  const [filtersData, setFiltersData] = useState<Filters>({
    search: filters.search ?? '',
    status: filters.status ?? '',
    date_from: filters.date_from ?? '',
    date_to: filters.date_to ?? '',
  });

  // const [search, setSearch] = useState(filters.search ?? '');

  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(filtersData.search, 400);

  useEffect(() => {
    if (debouncedSearch === (filters.search ?? '')) return; // skip on mount

    router.get('/admin/orders', cleanParams({ ...filtersData, search: debouncedSearch }), {
      preserveState: true,
      preserveScroll: true,
    });
  }, [debouncedSearch]);

  // useEffect(() => {
  //   router.get('/admin/orders', cleanParams({ ...filtersData }), { preserveState: true, preserveScroll: true });
  // }, [filtersData]);
  useEffect(() => {
    const hasFilters = Object.values(filtersData).some((v) => v !== '');
    const hadFilters = Object.values(filters).some((v) => v !== '');

    if (!hasFilters && !hadFilters) return; // both empty, skip

    router.get('/admin/orders', cleanParams({ ...filtersData }), {
      preserveState: true,
      preserveScroll: true,
    });
  }, [filtersData]);

  const cleanParams = (params: Filters) => {
    return Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== ''));
  };

  const handleReset = () => {
    setShowFilters(false);
    setFiltersData({
      search: '',
      status: '',
      date_from: '',
      date_to: '',
    });
    // router.get('/profile/orders', {}, { preserveState: true });
  };

  const handleFiltersChange = (updated: Filters, closeModal = false) => {
    if (updated.date_from && updated.date_to && updated.date_to < updated.date_from) {
      updated = { ...updated, date_to: updated.date_from };
    }
    // If date_to is set and date_from is later than date_to, clamp date_from
    if (updated.date_from && updated.date_to && updated.date_from > updated.date_to) {
      updated = { ...updated, date_from: updated.date_to };
    }

    setFiltersData(updated); //
    if (closeModal) setShowFilters(false);
  };

  const hasActiveFilters =
    filtersData.status !== '' ||
    filtersData.search !== '' ||
    filtersData.date_from !== '' ||
    filtersData.date_to !== '';

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-400 py-1">
        <h2 className="text-lg font-bold text-gray-900">Orders</h2>
      </div>

      <div className="mt-3 space-y-4">
        {/* Filters */}

        <div className="flex divide-x divide-gray-400 overflow-hidden rounded border border-gray-400 focus-within:ring-1 focus-within:ring-sky-800">
          <button
            className="flex cursor-pointer items-center gap-1.5 bg-sky-900 px-3 font-semibold text-white hover:bg-sky-800"
            onClick={() => setShowFilters(true)}
            disabled={loading}
          >
            <ListFilter size={20} />
            Filters
          </button>

          <input
            type="text"
            placeholder="Search by order # or product..."
            value={filtersData.search}
            onChange={(e) => setFiltersData((prev) => ({ ...prev, search: e.target.value }))}
            className="flex-1 px-2 py-1.5 outline-none"
          />
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {filtersData.status !== '' && (
              <div className="flex items-center divide-x divide-gray-400 rounded border border-gray-400 bg-sky-900 text-white">
                <p className="px-2 py-1 text-[10px]">Status : {filtersData.status}</p>
                <button
                  className="flex cursor-pointer items-center px-1 hover:bg-sky-800"
                  onClick={() => handleFiltersChange({ ...filtersData, status: '' })}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {filtersData.search !== '' && (
              <div className="flex items-center divide-x divide-gray-400 rounded border border-gray-400 bg-sky-900 text-white">
                <p className="px-2 py-1 text-[10px]">Search : {filtersData.search}</p>
                <button
                  className="flex cursor-pointer items-center px-1 hover:bg-sky-800"
                  onClick={() => handleFiltersChange({ ...filtersData, search: '' })}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {(filtersData.date_from !== '' || filtersData.date_to !== '') && (
              <div className="flex items-center divide-x divide-gray-400 rounded border border-gray-400 bg-sky-900 text-white">
                <p className="px-2 py-1 text-[10px]">
                  Dates : {filtersData.date_from} – {filtersData.date_to}
                </p>
                <button
                  className="flex cursor-pointer items-center px-1 hover:bg-sky-800"
                  onClick={() => handleFiltersChange({ ...filtersData, date_from: '', date_to: '' })}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* List */}
        {items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-x-2 gap-y-3 lg:grid-cols-2">
              {items.map((order) => {
                const status = statusConfig[order.status];
                return (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block overflow-hidden rounded border border-gray-400 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2 p-3">
                      <div className="space-y-1">
                        <p className="font-bold text-gray-800">{order.orderNumber}</p>
                        <p className="text-xs font-semibold text-gray-500 text-slate-400 uppercase">
                          {order.items?.length ?? 0} item(s)
                          {order.items?.[0] && ` · ${order.items[0].productName}`}
                          {(order.items?.length ?? 0) > 1 && ` +${(order.items?.length ?? 1) - 1} more`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={cn(
                            'rounded border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase',
                            status.className,
                          )}
                        >
                          {status.label}
                        </span>
                        <p className="text-sm font-bold text-gray-800">{formatPrice(order.finalTotal)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 bg-gray-100 px-3 py-1 text-[10px] font-semibold tracking-widest text-gray-500">
                      <p>{order.paymentMethod.toUpperCase()}</p>
                      <p>{order.createdAt}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Pagination meta={meta} type="advanced" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <ShoppingBag size={64} className="mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800">No orders found.</h2>
            <p className="mb-6 text-gray-500">Looks like you haven't made any orders yet.</p>
            <Link href="/" className="rounded-lg bg-sky-900 px-6 py-2 font-semibold text-white hover:bg-sky-800">
              Go Shopping
            </Link>
          </div>
        )}
      </div>
      {showFilters && (
        <OrdersFiltersModal
          filters={filtersData}
          statusOptions={Object.entries(statusConfig).map(([value, { label }]) => ({ label, value }))}
          onClose={() => setShowFilters(false)}
          onClear={handleReset}
          onApply={(updated) => handleFiltersChange(updated, true)}
        />
      )}
    </>
  );
};

Orders.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Orders;
