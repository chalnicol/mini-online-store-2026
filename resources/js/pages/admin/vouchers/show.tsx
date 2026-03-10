import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import AdminDetailCard from '@/components/store/admin/AdminDetailCard';
import AttachUsersToVouchers from '@/components/store/admin/AttachUsersToVouchers';
import ConfirmationModal from '@/components/store/ConfirmationModal';
import CustomButton from '@/components/store/CustomButton';
import MenuOptions from '@/components/store/MenuOptions';
import Pagination from '@/components/store/Pagination';
import PromptMessage from '@/components/store/PromptMessage';
import AdminLayout from '@/layouts/admin/layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, OptionDetails, PaginatedResponse, User, VoucherDetails } from '@/types/store';
import { formatDate } from '@/utils/DateUtils';
import { formatPrice } from '@/utils/PriceUtils';
import { Link, router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';

const VoucherShow = ({ voucher, users }: { voucher: VoucherDetails; users: PaginatedResponse<User> }) => {
  const { data: userList, meta, links } = users;

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Vouchers', href: '/admin/vouchers' },
    { title: `${voucher.code}` },
  ];

  const handleToggleActive = () => {
    router.patch(
      `/admin/vouchers/${voucher.id}/toggle-active-status`,
      {},
      {
        only: ['voucher'],
        preserveScroll: true,
        preserveState: true,
        replace: true,
        onBefore: () => setLoading(true),
        onError: (err: any) => {
          console.log(err);
        },
        onFinish: () => setLoading(false),
      },
    );
  };

  const options = useMemo<OptionDetails[]>(() => {
    const initialOptions: OptionDetails[] = [{ label: 'Delete Voucher', value: 'delete' }];

    //..
    if (!voucher.isExpired) {
      initialOptions.unshift({ label: 'Edit Voucher', value: 'edit' });
    }
    return initialOptions;
  }, [voucher]);

  const handleOptionsClick = (value: number | string | null) => {
    if (value === 'edit') {
      router.visit(`/admin/vouchers/${voucher.id}/edit`);
    } else if (value === 'delete') {
      // router.delete(`/admin/vouchers/${voucher.id}`);
      setShowDeleteConfirmation(true);
    }
  };

  const handleConfirmDelete = () => {
    router.delete(`/admin/vouchers/${voucher.id}`, {
      onBefore: () => setLoading(true),
      onError: (err: any) => {
        // console.log(err);
        setError(err.delete || 'Error deleting voucher.');
        setShowDeleteConfirmation(false);
      },
      onFinish: () => setLoading(false),
    });
  };

  const handleUpdateAttachedUsers = (action: 'attach' | 'detach', id: number) => {
    router.patch(
      `/admin/vouchers/${voucher.id}/update-attached-users`,
      { action, id },
      {
        preserveScroll: true,
        // preserveState: true,
        replace: true,
        only: ['users'],
        onBefore: () => setLoading(true),
        onError: (err: any) => {
          console.log(err);
        },
        onFinish: () => setLoading(false),
      },
    );
  }; // console.log(voucher)

  return (
    <>
      <AdminBreadcrumbs items={breadcrumbItems} />

      <div className="mt-4">
        <div className="flex items-center justify-between gap-x-2 border-b border-slate-400 pb-1 text-gray-900">
          <p className="font-bold lg:text-lg xl:text-xl">{voucher.code}</p>
          <MenuOptions pageOptions={options} onOptionsClick={handleOptionsClick} />
        </div>
        {error && <PromptMessage type="error" message={error} className="my-3" />}

        <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-6 px-3 md:grid-cols-2 lg:grid-cols-3">
          <AdminDetailCard title="ID">
            <p className="text-sm font-semibold">{voucher.id}</p>
          </AdminDetailCard>

          <AdminDetailCard title="Type">
            <p className="text-sm font-semibold tracking-wider uppercase">{voucher.type}</p>
          </AdminDetailCard>

          <AdminDetailCard title="Value">
            <p className="text-sm font-semibold tracking-widest uppercase">
              {voucher.type === 'percentage'
                ? `${Math.round(Number(voucher.value))}%`
                : `₱${Math.round(Number(voucher.value))}`}{' '}
              OFF
            </p>
          </AdminDetailCard>

          <AdminDetailCard title="Description">
            <p className="text-sm font-semibold">{voucher.description || '--'}</p>
          </AdminDetailCard>

          <AdminDetailCard title="Is Personal">
            <p>
              <span
                className={cn(
                  'rounded px-2 text-xs font-semibold tracking-widest text-white uppercase',
                  voucher.isPersonal ? 'bg-emerald-500' : 'bg-rose-500',
                )}
              >
                {voucher.isPersonal ? 'Yes' : 'No'}
              </span>
            </p>
          </AdminDetailCard>

          <AdminDetailCard title="Usage Limit">
            <p className="text-sm font-semibold">{voucher.usageLimit || '--'}</p>
          </AdminDetailCard>

          <AdminDetailCard title="Min. Spend">
            <p className="text-sm font-semibold">{voucher.minSpend ? formatPrice(voucher.minSpend) : '--'}</p>
          </AdminDetailCard>

          <AdminDetailCard title="Expires At">
            <p className={cn('text-sm font-semibold', voucher.isExpired ? 'text-rose-600' : 'text-sky-900')}>
              {voucher.expiresAt ? formatDate(voucher.expiresAt) : '--'}
            </p>
          </AdminDetailCard>

          <AdminDetailCard title="Used Count">
            <p className="text-sm font-semibold">{voucher.usedCount}</p>
          </AdminDetailCard>

          <AdminDetailCard title="Active Status" className="">
            <CustomButton
              label={voucher.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
              color={voucher.isActive ? 'danger' : 'success'}
              size="xs"
              onClick={handleToggleActive}
              disabled={loading}
              loading={loading}
              className="w-20"
            />
          </AdminDetailCard>

          <AdminDetailCard title="Attached users" className="md:col-span-2 lg:col-span-3">
            <AttachUsersToVouchers
              voucherId={voucher.id}
              loading={loading}
              onUpdate={handleUpdateAttachedUsers}
              className="mt-0.5 mb-3"
            />

            {userList.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {userList.map((user) => (
                    // <UserCardLink key={user.id} user={user} />
                    <div className="flex overflow-hidden rounded border border-gray-400 bg-gray-200 shadow hover:shadow-md">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="flex-1 border-e border-white px-2.5 py-1.5 hover:bg-gray-100"
                      >
                        <p className="font-bold text-gray-600">
                          {user.fname} {user.lname}
                        </p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                      </Link>
                      <button
                        onClick={() => handleUpdateAttachedUsers('detach', user.id)}
                        className="flex flex-shrink-0 cursor-pointer items-center border-s border-gray-400 px-1.5 hover:bg-gray-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <Pagination meta={meta} className="mt-1" type="advanced" />
              </>
            ) : (
              <span className="text-sm font-semibold text-gray-400"> No users attached. </span>
            )}
          </AdminDetailCard>
        </div>
      </div>

      {showDeleteConfirmation && (
        <ConfirmationModal
          message="Are you sure you want to delete this variant?"
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
};

VoucherShow.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default VoucherShow;
