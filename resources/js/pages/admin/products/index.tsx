import AdminSearchBar from '@/components/store/admin/AdminSearchBar';
import Pagination from '@/components/store/Pagination';
import TitleBar from '@/components/store/TitleBar';
import AdminLayout from '@/layouts/admin/layout';
import type { PaginatedResponse, Product } from '@/types/store';
import { Link } from '@inertiajs/react';
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

    return (
        <>
            {/* <AdminBreadcrumbs items={breadcrumbItems} className="mb-1" /> */}

            <TitleBar title="Products" className="mb-3" />

            <AdminSearchBar
                table="products"
                filters={filters}
                className="mb-3"
            />

            <div>
                {items.length > 0 ? (
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-2 rounded border border-gray-400 p-2 shadow"
                            >
                                <div className="flex-1 space-y-1.5">
                                    <p className="text-sm font-bold">
                                        {item.name}
                                    </p>
                                    <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                        Variants : {item.variantsCount}
                                    </p>

                                    {/* {item.variantsCount > 1 ? (
                                        <div className="flex flex-wrap items-center gap-1">
                                            {item.variants.map((variant) => (
                                                <p className="rounded border border-gray-400 bg-gray-100 px-2 text-xs font-bold text-gray-600">
                                                    {variant.name}
                                                </p>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] tracking-widest uppercase">
                                            - single variant -
                                        </span>
                                    )} */}
                                </div>
                                <Link
                                    href={`/admin/products/${item.id}`}
                                    className="flex items-center rounded bg-sky-900 px-2 py-1 text-xs font-semibold text-white"
                                >
                                    VIEW
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 py-10 text-center">
                        <User2Icon size={64} className="mb-4 text-gray-300" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            No Products found.
                        </h2>
                        <p className="mb-6 text-gray-500">
                            Server may be down. Please try again later.
                        </p>
                    </div>
                )}
            </div>

            <Pagination meta={meta} type="advanced" />
        </>
    );
};

ProductListing.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default ProductListing;
