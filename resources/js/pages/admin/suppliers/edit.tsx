import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import SupplierForm from '@/components/store/admin/forms/SupplierForm';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem, Supplier } from '@/types/store';

const SupplierEdit = ({ supplier }: { supplier: Supplier }) => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Suppliers', href: '/admin/suppliers' },
    { title: `${supplier.name}`, href: `/admin/suppliers/${supplier.id}` },
    { title: 'Edit' },
  ];

  return (
    <div>
      <AdminBreadcrumbs items={breadcrumbItems} />

      <div className="my-3 flex items-center justify-between border-b border-gray-400 py-1">
        <h2 className="text-lg font-bold text-gray-900">Edit Supplier</h2>
      </div>
      <SupplierForm supplier={supplier} />
    </div>
  );
};

SupplierEdit.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default SupplierEdit;
