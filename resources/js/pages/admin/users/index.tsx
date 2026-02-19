import AdminSearchBar from '@/components/store/admin/AdminSearchBar';
import Pagination from '@/components/store/Pagination';
import TitleBar from '@/components/store/TitleBar';
import AdminLayout from '@/layouts/admin/layout';
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

            <TitleBar title="Users" className="mb-3" />

            <AdminSearchBar table="users" filters={filters} className="mb-3" />
            <div>
                {items.length > 0 ? (
                    <>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-2 rounded border border-gray-400 p-2 shadow"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">
                                            {item.fname} {item.lname}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {item.email}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/admin/users/${item.id}`}
                                        className="flex items-center rounded bg-sky-900 px-2 py-1 text-xs font-semibold text-white"
                                    >
                                        VIEW
                                    </Link>
                                </div>
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
