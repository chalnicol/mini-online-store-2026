import AdminSearchBar from '@/components/store/admin/AdminSearchBar';
import MenuOptions from '@/components/store/MenuOptions';
import Pagination from '@/components/store/Pagination';
import Rating from '@/components/store/Rating';
import AdminLayout from '@/layouts/admin/layout';
import { cn } from '@/lib/utils';
import type { OptionDetails, PaginatedResponse, Product } from '@/types/store';
import { formatDate } from '@/utils/DateUtils';
import { Link, router } from '@inertiajs/react';
import { User2Icon } from 'lucide-react';

interface ProductListingProps {
  products: PaginatedResponse<Product>;
  filters: {
    search: string;
  };
}

const ProductListing = ({ products, filters }: ProductListingProps) => {
  const { data: items, meta, links } = products;

  const breadcrumbItems = [{ title: 'Products' }];

  const productsOptions: OptionDetails[] = [{ label: 'Create New Product', value: 'create' }];

  const handleOptionsClick = (value: number | string | null) => {
    if (value == 'create') {
      router.visit('/admin/products/create');
    }
  };

  return (
    <>
      {/* <AdminBreadcrumbs items={breadcrumbItems} className="mb-1" /> */}

      <div className="flex items-center justify-between border-b border-gray-400 py-1">
        <h2 className="text-lg font-bold text-gray-900">Products</h2>
        <MenuOptions pageOptions={productsOptions} onOptionsClick={handleOptionsClick} />
      </div>
      <AdminSearchBar table="products" filters={filters} className="my-3 flex-1" />

      <div>
        {items.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/admin/products/${item.id}`}
                className="overflow-hidden rounded border border-gray-400 shadow hover:shadow-md"
              >
                {/* <p className="flex min-w-10 flex-shrink-0 items-center justify-center rounded bg-gray-300 p-0.5 px-2 text-center text-xs font-bold tracking-widest text-gray-700">
                                    {item.id < 10 ? `0${item.id}` : item.id}
                                </p> */}
                <div className="flex gap-2 p-2">
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-gray-600">{item.name}</p>

                    <div className="flex items-center gap-x-1.5">
                      <p className="min-w-6 bg-gray-300 px-2 text-center text-[10px] font-bold text-gray-600">
                        {item.variantsCount}
                      </p>
                      <Rating rating={item.averageRating} size="sm" />
                    </div>
                  </div>
                  <div className="flex flex-none flex-col gap-1">
                    {/* <p className="flex aspect-square items-center justify-center border-gray-300 bg-sky-900 px-1 text-[10px] font-bold tracking-wider text-white">
                                            {item.variantsCount}
                                        </p> */}
                    <p
                      className={cn(
                        'aspect-square w-2 rounded-full',
                        item.isPublished ? 'bg-emerald-600' : 'bg-rose-600',
                      )}
                    ></p>
                  </div>
                </div>
                <div className="flex justify-between border-t border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-gray-600">
                  <p>
                    ID:
                    {item.id < 10 ? `0${item.id}` : item.id}
                  </p>
                  <p>{formatDate(item.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 py-10 text-center">
            <User2Icon size={64} className="mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800">No Products found.</h2>
            <p className="mb-6 text-gray-500">Server may be down. Please try again later.</p>
          </div>
        )}
      </div>

      <Pagination meta={meta} type="advanced" />
    </>
  );
};

ProductListing.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default ProductListing;
