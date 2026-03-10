import AdminSearchBar from '@/components/store/admin/AdminSearchBar';
import Pagination from '@/components/store/Pagination';
import AdminLayout from '@/layouts/admin/layout';
import type { OptionDetails, PaginatedResponse, PriceHistory } from '@/types/store';
import { formatDate } from '@/utils/DateUtils';
import { Link } from '@inertiajs/react';
import { Book } from 'lucide-react';

const PriceHistoryListing = ({
  priceHistory,
  filters,
}: {
  priceHistory: PaginatedResponse<PriceHistory>;
  filters: {
    search: string;
  };
}) => {
  const { data: items, meta, links } = priceHistory;

  console.log('items', items);

  // const breadcrumbItems = [{ title: 'Inventories' }];

  const productsOptions: OptionDetails[] = [
    //
  ];

  const handleOptionsClick = (value: number | string | null) => {
    // switch (value) {
    //   case 'add-purchase':
    //     router.visit('/admin/inventories/create-purchase');
    //     break;
    //   case 'add-adjustment':
    //     router.visit('/admin/inventories/create-adjustment');
    //     break;
    //   case 'add-purchase-return':
    //     router.visit('/admin/inventories/create-purchase-return');
    //     break;
    //   case 'add-customer-return':
    //     router.visit('/admin/inventories/create-customer-return');
    //     break;
    //   case 'add-sale':
    //     router.visit('/admin/inventories/create-sale');
    //     break;
    //   default:
    //     break;
    // }
  };

  return (
    <>
      {/* <AdminBreadcrumbs items={breadcrumbItems} className="mb-1" /> */}
      <div className="flex items-center justify-between border-b border-gray-400 py-1">
        <h2 className="text-lg font-bold text-gray-900">Price History</h2>
        {/* <MenuOptions pageOptions={productsOptions} onOptionsClick={handleOptionsClick} /> */}
      </div>

      <AdminSearchBar table="price-history" filters={filters} className="my-3" label="Search price history" />
      <div>
        {items.length > 0 ? (
          <>
            <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/price-history/${item.id}`}
                  className="flex flex-col overflow-hidden rounded border border-gray-400 shadow hover:shadow-md"
                >
                  <div className="flex gap-x-3 px-2.5 py-2">
                    <div className="flex-1 space-y-1.5">Price History</div>
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
            <h2 className="text-2xl font-bold text-gray-800">No Price History found.</h2>
            <p className="mb-6 text-gray-500">Server may be down. Please try again later.</p>
          </div>
        )}
      </div>
    </>
  );
};

PriceHistoryListing.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default PriceHistoryListing;
