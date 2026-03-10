import AdminSearchBar from '@/components/store/admin/AdminSearchBar';
import MenuOptions from '@/components/store/MenuOptions';
import Pagination from '@/components/store/Pagination';
import AdminLayout from '@/layouts/admin/layout';
import { cn } from '@/lib/utils';
import type {
  InventoryMovement,
  InventoryMovementStatus,
  InventoryMovementType,
  OptionDetails,
  PaginatedResponse,
} from '@/types/store';
import { formatDate } from '@/utils/DateUtils';
import { formatPrice } from '@/utils/PriceUtils';
import { Link, router } from '@inertiajs/react';
import { Book } from 'lucide-react';

const InventoryListing = ({
  inventories,
  filters,
}: {
  inventories: PaginatedResponse<InventoryMovement>;
  filters: {
    search: string;
  };
}) => {
  const { data: items, meta, links } = inventories;

  // const breadcrumbItems = [{ title: 'Inventories' }];

  const productsOptions: OptionDetails[] = [
    { label: 'Add Purchase', value: 'add-purchase' },
    { label: 'Add Adjustment', value: 'add-adjustment' },
    { label: 'Add Purchase Return', value: 'add-purchase-return' },
    { label: 'Add Customer Return', value: 'add-customer-return' },
    { label: 'Add Sale', value: 'add-sale' },
  ];

  const handleOptionsClick = (value: number | string | null) => {
    switch (value) {
      case 'add-purchase':
        router.visit('/admin/inventories/create-purchase');
        break;
      case 'add-adjustment':
        router.visit('/admin/inventories/create-adjustment');
        break;
      case 'add-purchase-return':
        router.visit('/admin/inventories/create-purchase-return');
        break;
      case 'add-customer-return':
        router.visit('/admin/inventories/create-customer-return');
        break;
      case 'add-sale':
        router.visit('/admin/inventories/create-sale');
        break;
      default:
        break;
    }
  };

  const inventoryType: Record<InventoryMovementType, { cls: string; label: string }> = {
    purchase: {
      cls: 'text-sky-900',
      label: 'P',
    },
    customer_return: {
      cls: 'text-indigo-500',
      label: 'S',
    },
    purchase_return: {
      cls: 'text-info-400',
      label: 'R',
    },
    sale: {
      cls: 'text-emerald-600',
      label: 'R',
    },
    adjustment: {
      cls: 'text-slate-400',
      label: 'A',
    },
  };

  const inventoryStatus: Record<InventoryMovementStatus, { cls: string; label: string }> = {
    available: {
      cls: 'bg-emerald-500 text-white',
      label: 'A',
    },
    damaged: {
      cls: 'bg-rose-500 text-white',
      label: 'D',
    },
    quarantine: {
      cls: 'bg-orange-600',
      label: 'Q',
    },
    lost: {
      cls: 'bg-gray-400',
      label: 'L',
    },
  };

  return (
    <>
      {/* <AdminBreadcrumbs items={breadcrumbItems} className="mb-1" /> */}
      <div className="flex items-center justify-between border-b border-gray-400 py-1">
        <h2 className="text-lg font-bold text-gray-900">Inventory Movements</h2>
        <MenuOptions pageOptions={productsOptions} onOptionsClick={handleOptionsClick} />
      </div>

      <AdminSearchBar table="inventories" filters={filters} className="my-3" />
      <div>
        {items.length > 0 ? (
          <>
            <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/inventories/${item.id}`}
                  className="flex flex-col overflow-hidden rounded border border-gray-400 shadow hover:shadow-md"
                >
                  <div className="flex gap-x-3 px-2.5 py-2">
                    <div className="flex-1 space-y-1">
                      <p
                        className={cn('text-[10px] font-bold tracking-widest uppercase', inventoryType[item.type].cls)}
                      >
                        {item.type}
                      </p>

                      {/* product & variant */}
                      <p className="space-x-2 text-sm font-semibold text-slate-600">
                        <span>{item.variant?.product?.name || 'Product Name'}</span>
                        <span>-</span>
                        <span>{item.variant?.name || 'Variant Name'}</span>
                      </p>

                      <div className="flex flex-wrap gap-1 text-[10px] font-semibold">
                        {item.type == 'purchase' && (
                          <p className="bg-sky-200 px-1.5 tracking-widest text-gray-700">
                            {formatPrice(item.unitCost)}
                          </p>
                        )}
                        <p
                          className={cn(
                            'bg-gray-200 px-1.5 text-white',
                            item.quantity < 0 ? 'bg-rose-500' : 'bg-emerald-500',
                          )}
                        >
                          {item.quantity}
                        </p>
                        <p className={cn('px-1.5 tracking-widest uppercase', inventoryStatus[item.status].cls)}>
                          {item.status}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-between border-t border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-gray-600">
                    <p>
                      ID:
                      {item.id < 10 ? `0${item.id}` : item.id}
                    </p>
                    <p>{formatDate(item.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination meta={meta} type="advanced" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 py-10 text-center">
            <Book size={64} className="mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800">No Inventory Movements found.</h2>
            <p className="mb-6 text-gray-500">Server may be down. Please try again later.</p>
          </div>
        )}
      </div>
    </>
  );
};

InventoryListing.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default InventoryListing;
