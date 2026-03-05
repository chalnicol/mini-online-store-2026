import AdminSearchBar from '@/components/store/admin/AdminSearchBar';
import MenuOptions from '@/components/store/MenuOptions';
import Pagination from '@/components/store/Pagination';
import AdminLayout from '@/layouts/admin/layout';
import type { OptionDetails, PaginatedResponse, Supplier } from '@/types/store';
import { Link, router } from '@inertiajs/react';
import { User2Icon } from 'lucide-react';

interface SupplierListingProps {
  suppliers: PaginatedResponse<Supplier>;
  filters: {
    search: string;
  };
}

const SupplierListing = ({ suppliers, filters }: SupplierListingProps) => {
  const { data: items, meta, links } = suppliers;

  const options: OptionDetails[] = [{ label: 'Create New Supplier', value: 'create' }];

  const handleOptionsClick = (value: number | string | null) => {
    if (value == 'create') {
      router.visit('/admin/suppliers/create');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-400 py-1">
        <h2 className="text-lg font-bold text-gray-900">Suppliers</h2>
        <MenuOptions pageOptions={options} onOptionsClick={handleOptionsClick} />
      </div>

      <AdminSearchBar table="suppliers" filters={filters} className="my-3" />
      <div>
        {items.length > 0 ? (
          <>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/suppliers/${item.id}`}
                  className="flex flex-col overflow-hidden rounded border border-gray-400 shadow hover:shadow-md"
                >
                  <div className="px-2 py-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs">{item.email}</p>
                  </div>

                  <div className="mt-auto border-t border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-gray-600">
                    ID:
                    {item.id < 10 ? `0${item.id}` : item.id}
                  </div>
                </Link>
              ))}
            </div>
            <Pagination meta={meta} type="advanced" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 py-10 text-center">
            <User2Icon size={64} className="mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800">No suppliers found.</h2>
            <p className="mb-6 text-gray-500">Server may be down. Please try again later.</p>
          </div>
        )}
      </div>
    </>
  );
};

SupplierListing.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default SupplierListing;
