import AdminSearchBar from '@/components/store/admin/AdminSearchBar';
import Pagination from '@/components/store/Pagination';
import AdminLayout from '@/layouts/admin/layout';
import { cn } from '@/lib/utils';
import type { PaginatedResponse, User } from '@/types/store';
import { Link } from '@inertiajs/react';
import { User2Icon } from 'lucide-react';

interface UserListingProps {
    users: PaginatedResponse<User>;
    filters: {
        search: string;
    };
}

const UserListing = ({ users, filters }: UserListingProps) => {
    const { data: items, meta, links } = users;

    const breadcrumbItems = [{ title: 'Users' }];

    return (
        <>
            {/* <AdminBreadcrumbs items={breadcrumbItems} className="mb-1" /> */}

            <div className="flex items-center justify-between border-b border-gray-400 py-1">
                <h2 className="text-lg font-bold text-gray-900">Users</h2>
            </div>

            <AdminSearchBar table="users" filters={filters} className="my-3" />
            <div>
                {items.length > 0 ? (
                    <>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {items.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/admin/users/${item.id}`}
                                    className="flex gap-2 rounded border border-gray-400 p-2 shadow hover:shadow-md"
                                >
                                    <p className="flex min-w-10 flex-shrink-0 items-center justify-center rounded bg-gray-300 p-0.5 px-2 text-center text-xs font-bold tracking-widest text-gray-700">
                                        {item.id < 10 ? `0${item.id}` : item.id}
                                    </p>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-x-1.5 text-sm text-slate-500">
                                            <p className="text-sm font-bold">
                                                {item.fname} {item.lname}
                                            </p>
                                        </div>
                                        <p className="text-xs">{item.email}</p>
                                    </div>

                                    <div className="flex flex-none flex-col gap-1">
                                        <p
                                            className={cn(
                                                'aspect-square h-2 rounded-full',
                                                item.isBlocked
                                                    ? 'bg-rose-500'
                                                    : 'bg-green-600',
                                            )}
                                        ></p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Pagination meta={meta} type="advanced" />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 py-10 text-center">
                        <User2Icon size={64} className="mb-4 text-gray-300" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            No users found.
                        </h2>
                        <p className="mb-6 text-gray-500">
                            Server may be down. Please try again later.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

UserListing.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default UserListing;
