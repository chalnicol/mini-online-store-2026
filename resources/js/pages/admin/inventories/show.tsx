import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import AdminDetailCard from '@/components/store/admin/AdminDetailCard';
import PromptMessage from '@/components/store/PromptMessage';
import SelectSearchModal from '@/components/store/SelectSearchModal';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem, InventoryMovement, Supplier } from '@/types/store';
import { formatDate } from '@/utils/DateUtils';
import { Link } from '@inertiajs/react';
import { Edit } from 'lucide-react';
import { useState } from 'react';

const InventoryMovementShow = ({ inventory }: { inventory: InventoryMovement }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Inventory Movements', href: '/admin/inventories' },
    // { title: `${inventory.name}` },
    { title: `Inventory Movement (${inventory.id})` },
  ];

  const handleUpdateSupplier = (value: number[]) => {
    //..
  };

  const [showSelectSearchUser, setShowSelectSearchUser] = useState<boolean>(false);

  return (
    <>
      <AdminBreadcrumbs items={breadcrumbItems} />

      <div className="mt-4">
        <div className="flex items-center justify-between gap-x-2 border-b border-slate-400 pb-1 text-gray-900">
          <p className="font-bold lg:text-lg xl:text-xl">Inventory Movement</p>
        </div>
        {error && <PromptMessage type="error" message={error} className="my-3" />}

        <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-6 px-3 sm:grid-cols-2 lg:grid-cols-3">
          <AdminDetailCard title="ID">
            <p className="text-sm font-semibold">{inventory.id}</p>
          </AdminDetailCard>

          <AdminDetailCard title="Product/Variant">
            <Link
              href={`/admin/products/variants/${inventory.variant?.id || ''}`}
              className="font-semibold text-sky-600 hover:text-gray-500"
            >
              <p className="space-x-1">
                <span>{inventory.variant?.product?.name || 'Product Name'}</span>
                <span>/</span>
                <span>{inventory.variant?.name || 'Variant Name'}</span>
              </p>
            </Link>
          </AdminDetailCard>

          <AdminDetailCard title="Type">
            <p>
              <span className="rounded border border-gray-300 bg-gray-100 px-2 text-xs font-semibold tracking-widest text-slate-400 uppercase shadow">
                {inventory.type}
              </span>
            </p>
          </AdminDetailCard>

          <AdminDetailCard title="Status">
            <p>
              <span className="rounded border border-gray-300 bg-gray-100 px-2 text-xs font-semibold tracking-widest text-slate-400 uppercase shadow">
                {inventory.status}
              </span>
            </p>
          </AdminDetailCard>

          <AdminDetailCard title="Created At">
            <p className="text-sm font-semibold">{formatDate(inventory.createdAt)}</p>
          </AdminDetailCard>

          <AdminDetailCard title="Updated At">
            <p className="text-sm font-semibold">{formatDate(inventory.updatedAt)}</p>
          </AdminDetailCard>

          {/* add supplier if available */}
          {inventory.supplier && (
            <AdminDetailCard title="Supplier">
              <div className="flex items-start gap-x-2">
                <Link
                  href={`/admin/suppliers/${inventory.supplier.id || ''}`}
                  className="font-semibold text-sky-600 hover:text-gray-500"
                >
                  {inventory.supplier.name || 'Supplier Name'}
                </Link>
                <button
                  className="mt-1 cursor-pointer rounded p-0.5 hover:bg-gray-200 active:scale-95"
                  onClick={() => setShowSelectSearchUser(true)}
                >
                  <Edit size={14} />
                </button>
              </div>
            </AdminDetailCard>
          )}

          <AdminDetailCard title="Created By">
            <Link
              href={`/admin/users/${inventory.user?.id || ''}`}
              className="font-semibold text-sky-600 hover:text-gray-500"
            >
              {`${inventory.user?.fname} ${inventory.user?.lname}` || 'User Name'}
            </Link>
          </AdminDetailCard>

          <AdminDetailCard title="Reason" className="lg:cols-span-3 md:col-span-2">
            <p className="text-sm font-semibold">{inventory.reason || 'No Reason Available'}</p>
          </AdminDetailCard>
        </div>
      </div>

      {showSelectSearchUser && (
        <SelectSearchModal<Supplier>
          selected={inventory.supplier ? [inventory.supplier] : []}
          label="Edit Supplier"
          placeholder="Search Supplier"
          itemsMaxCount={1}
          targetTable="suppliers"
          renderSearchItem={(item) => (
            <div>
              <p className="text-sm font-bold">{item.name}</p>
              <p className="text-xs font-semibold text-slate-400">{item.email}</p>
            </div>
          )}
          renderItem={(item) => <p className="flex-1 px-2 py-0.5 text-sm font-bold">{item.name}</p>}
          onSubmit={handleUpdateSupplier}
          onClose={() => setShowSelectSearchUser(false)}
        />
      )}
    </>
  );
};

InventoryMovementShow.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default InventoryMovementShow;
