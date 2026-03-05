import AdminSearchBar from '@/components/store/admin/AdminSearchBar';
import UserCardLink from '@/components/store/admin/UserCardLink';
import Pagination from '@/components/store/Pagination';
import AdminLayout from '@/layouts/admin/layout';
import type { PaginatedResponse, User } from '@/types/store';
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
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <UserCardLink key={item.id} user={item} />
              ))}
            </div>
            <Pagination meta={meta} type="advanced" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 py-10 text-center">
            <User2Icon size={64} className="mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800">No users found.</h2>
            <p className="mb-6 text-gray-500">Server may be down. Please try again later.</p>
          </div>
        )}
      </div>
    </>
  );
};

UserListing.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default UserListing;
