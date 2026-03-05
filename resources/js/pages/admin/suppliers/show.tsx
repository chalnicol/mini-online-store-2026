import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import AdminDetailCard from '@/components/store/admin/AdminDetailCard';
import ConfirmationModal from '@/components/store/ConfirmationModal';
import MenuOptions from '@/components/store/MenuOptions';
import PromptMessage from '@/components/store/PromptMessage';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem, OptionDetails, Supplier } from '@/types/store';
import { router } from '@inertiajs/react';
import { useState } from 'react';

const SupplierShow = ({ supplier }: { supplier: Supplier }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Suppliers', href: '/admin/suppliers' },
    { title: `${supplier.name}` },
  ];

  const options: OptionDetails[] = [
    { label: 'Edit Supplier', value: 'edit' },
    { label: 'Delete Supplier', value: 'delete' },
  ];

  const handleOptionsClick = (value: number | string | null) => {
    if (value === 'edit') {
      router.visit(`/admin/suppliers/${supplier.id}/edit`);
    } else if (value === 'delete') {
      setShowDeleteConfirmation(true);
    }
  };

  const handleConfirmDelete = () => {
    router.delete(`/admin/suppliers/${supplier.id}`, {
      onBefore: () => setLoading(true),
      onError: (err: any) => {
        // console.log(err);
        setError(err.delete || 'Error deleting supplier.');
        setShowDeleteConfirmation(false);
      },
      onFinish: () => setLoading(false),
    });
  };

  return (
    <>
      <AdminBreadcrumbs items={breadcrumbItems} />

      <div className="mt-4">
        <div className="flex items-center justify-between gap-x-2 border-b border-slate-400 pb-1 text-gray-900">
          <p className="font-bold lg:text-lg xl:text-xl">{supplier.name}</p>
          <MenuOptions pageOptions={options} onOptionsClick={handleOptionsClick} />
        </div>
        {error && <PromptMessage type="error" message={error} className="my-3" />}

        <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-6 px-3 md:grid-cols-2 lg:grid-cols-3">
          <AdminDetailCard title="ID">
            <p className="text-sm font-semibold">{supplier.id}</p>
          </AdminDetailCard>

          <AdminDetailCard title="Email">
            <p className="text-sm font-semibold">{supplier.email || 'No Email Available'}</p>
          </AdminDetailCard>

          <AdminDetailCard title="Contact Number">
            <p className="text-sm font-semibold tracking-widest uppercase">
              {supplier.contactNumber || 'No Contact Number Available'}
            </p>
          </AdminDetailCard>

          <AdminDetailCard title="Contact Person">
            <p className="text-sm font-semibold">{supplier.contactPerson || 'No Contact Person Available'}</p>
          </AdminDetailCard>
        </div>
      </div>

      {showDeleteConfirmation && (
        <ConfirmationModal
          message="Are you sure you want to delete this supplier?"
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
};

SupplierShow.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default SupplierShow;
