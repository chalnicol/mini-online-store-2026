import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import AdminDetailCard from '@/components/store/admin/AdminDetailCard';
import AddressCard from '@/components/store/CheckoutAddressCard';
import CustomButton from '@/components/store/CustomButton';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem, User } from '@/types/store';
import { useState } from 'react';

interface UserDetailsProps {
    user: User;
}

const UserDetails = ({ user }: UserDetailsProps) => {
    const [loading, setLoading] = useState(false);

    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Users', href: '/admin/users' },
        { title: `${user.fname} ${user.lname}` },
    ];

    return (
        <>
            <AdminBreadcrumbs items={breadcrumbItems} />

            <div className="mt-4">
                <div className="flex items-center gap-x-2 border-b border-gray-400 py-1.5 text-gray-900">
                    <p className="rounded border bg-sky-900 px-3 text-sm font-bold text-white md:text-base">
                        {user.id}
                    </p>
                    <h2 className="font-bold lg:text-lg xl:text-xl">
                        {user.fname} {user.lname}
                    </h2>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-6 px-3 md:grid-cols-2">
                    <AdminDetailCard title="Email">
                        <p className="text-sm font-semibold">{user.email}</p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Roles">
                        {user.roles && user.roles.length > 0 ? (
                            <div className="flex flex-wrap items-center">
                                {user.roles.map((role) => (
                                    <span
                                        key={role}
                                        className="rounded border border-gray-400 px-2 text-xs font-semibold tracking-wider uppercase shadow"
                                    >
                                        {role}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-xs"> -- </span>
                        )}
                    </AdminDetailCard>

                    <AdminDetailCard title="Member Since">
                        <p className="text-sm font-semibold">
                            {user.memberSince}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Account Status" className="">
                        <CustomButton
                            label={user.isBlocked ? 'UNBLOCK' : 'BLOCK'}
                            color={user.isBlocked ? 'info' : 'danger'}
                            size="xs"
                            onClick={() => {}}
                            disabled={loading}
                            className="w-20"
                        />
                    </AdminDetailCard>

                    <AdminDetailCard
                        title="Addresses"
                        className="md:col-span-2"
                    >
                        {user.addresses && user.addresses.length > 0 ? (
                            <div className="mb-1 space-y-1.5">
                                {user.addresses.map((address) => (
                                    <AddressCard
                                        key={address.id}
                                        address={address}
                                        className="rounded border border-slate-300 bg-gray-100 px-3 py-2"
                                    />
                                ))}
                            </div>
                        ) : (
                            <span className="text-xs"> - empty -</span>
                        )}
                    </AdminDetailCard>
                </div>
            </div>
        </>
    );
};

UserDetails.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default UserDetails;
