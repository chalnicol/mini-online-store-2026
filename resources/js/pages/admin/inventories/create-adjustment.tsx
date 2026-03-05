import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import AdjustmentForm from '@/components/store/admin/forms/AdjustmentForm';

import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem } from '@/types/store';

const AdjustmentCreate = () => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Inventory Movements', href: '/admin/inventories' },
    { title: 'Add Adjustment' },
  ];

  return (
    <div>
      <AdminBreadcrumbs items={breadcrumbItems} />

      <div className="my-3 flex items-center justify-between border-b border-gray-400 py-1">
        <h2 className="text-lg font-bold text-gray-900">Add Adjustment</h2>
      </div>
      <AdjustmentForm />
    </div>
  );
};

AdjustmentCreate.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default AdjustmentCreate;
