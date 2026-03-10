import AdminLayout from '@/layouts/admin/layout';
import { User2Icon } from 'lucide-react';

const Sales = () => {
  return (
    <>
      {/* <AdminBreadcrumbs items={breadcrumbItems} className="mb-1" /> */}

      <div className="flex items-center justify-between border-b border-gray-400 py-1">
        <h2 className="text-lg font-bold text-gray-900">Sales</h2>
      </div>

      <div className="flex flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 py-10 text-center">
        <User2Icon size={64} className="mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-800">No Sales found.</h2>
        <p className="mb-6 text-gray-500">Server may be down. Please try again later.</p>
      </div>
    </>
  );
};

Sales.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default Sales;
