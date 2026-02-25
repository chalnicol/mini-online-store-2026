import AdminSearchBar from '@/components/store/admin/AdminSearchBar';
import MenuOptions from '@/components/store/MenuOptions';
import Pagination from '@/components/store/Pagination';
import AdminLayout from '@/layouts/admin/layout';
import { cn } from '@/lib/utils';
import type { Discount, OptionDetails, PaginatedResponse } from '@/types/store';
import { Link, router } from '@inertiajs/react';
import { User2Icon } from 'lucide-react';

const DiscountListing = ({
    discounts,
    filters,
}: {
    discounts: PaginatedResponse<Discount>;
    filters: {
        search: string;
    };
}) => {
    const { data: items, meta, links } = discounts;

    const breadcrumbItems = [{ title: 'Discounts' }];

    const productsOptions: OptionDetails[] = [
        { label: 'Create New Discount', value: 'create' },
    ];

    const handleOptionsClick = (value: number | string | null) => {
        if (value == 'create') {
            router.visit('/admin/discounts/create');
        }
    };

    return (
        <>
            {/* <AdminBreadcrumbs items={breadcrumbItems} className="mb-1" /> */}

            <div className="flex items-center justify-between border-b border-gray-400 py-1">
                <h2 className="text-lg font-bold text-gray-900">Discounts</h2>
                <MenuOptions
                    pageOptions={productsOptions}
                    onOptionsClick={handleOptionsClick}
                />
            </div>
            <AdminSearchBar
                table="discounts"
                filters={filters}
                className="my-3 flex-1"
            />

            <div>
                {items.length > 0 ? (
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <Link
                                key={item.id}
                                href={`/admin/discounts/${item.id}`}
                                className="overflow-hidden rounded border border-gray-400 shadow hover:shadow-md"
                            >
                                {/* <p className="flex min-w-10 flex-shrink-0 items-center justify-center rounded bg-gray-300 p-0.5 px-2 text-center text-xs font-bold tracking-widest text-gray-700">
                                    {item.id < 10 ? `0${item.id}` : item.id}
                                </p> */}
                                <div className="flex gap-2 p-2">
                                    <div className="flex-1 space-y-0.5">
                                        <p className="flex items-center gap-x-1.5 text-sm font-bold text-slate-500">
                                            <span
                                                className={cn(
                                                    'aspect-square px-1 text-xs text-white',
                                                    item.type == 'fixed'
                                                        ? 'bg-orange-600'
                                                        : 'bg-lime-600',
                                                )}
                                            >
                                                {item.type == 'fixed'
                                                    ? 'F'
                                                    : 'P'}
                                            </span>
                                            {item.code}
                                        </p>
                                        <p className="space-x-1.5 text-xs font-semibold text-slate-400">
                                            <span>{item.description}</span>
                                            <span> &bull;</span>
                                            <span>{`${item.value}${item.type == 'fixed' ? 'PHP' : '%'} OFF`}</span>
                                            <span> &bull;</span>
                                            <span className="bg-gray-300 px-2 text-[10px] font-bold text-gray-600">
                                                {item.variantsCount}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex flex-none flex-col gap-1">
                                        {/* <p
                                            className={cn(
                                                'flex min-w-5 flex-1 items-center justify-center bg-sky-900 px-1 text-[10px] font-bold tracking-wider text-white',
                                            )}
                                        >
                                            {item.variantsCount}
                                        </p> */}
                                        <p
                                            className={cn(
                                                'aspect-square w-2 rounded-full',
                                                item.isActive
                                                    ? 'bg-green-600'
                                                    : 'bg-rose-600',
                                            )}
                                        ></p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-gray-600">
                                    ID:
                                    {item.id < 10 ? `0${item.id}` : item.id}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 py-10 text-center">
                        <User2Icon size={64} className="mb-4 text-gray-300" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            No Discounts found.
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

DiscountListing.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default DiscountListing;
