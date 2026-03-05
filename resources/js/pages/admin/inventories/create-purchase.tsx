import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import PurchaseForm from '@/components/store/admin/forms/PurchaseForm';

import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem } from '@/types/store';

const PurchaseCreate = () => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Inventory Movements', href: '/admin/inventories' },
    { title: 'Add Purchase' },
  ];

  return (
    <div>
      <AdminBreadcrumbs items={breadcrumbItems} />

      <div className="my-3 flex items-center justify-between border-b border-gray-400 py-1">
        <h2 className="text-lg font-bold text-gray-900">Add Purchase</h2>
      </div>
      <PurchaseForm />
    </div>
  );
};

PurchaseCreate.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default PurchaseCreate;
