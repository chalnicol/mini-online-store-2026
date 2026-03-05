import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import AdminDetailCard from '@/components/store/admin/AdminDetailCard';
import CategoryCardLink from '@/components/store/admin/CategoryCardLink';
import ProductCardLink from '@/components/store/admin/ProductCardLink';
import Pagination from '@/components/store/Pagination';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem, Category, PaginatedResponse, Product } from '@/types/store';
import { useState } from 'react';

const CategoryShow = ({ category, products }: { category: Category; products: PaginatedResponse<Product> }) => {
  const [loading, setLoading] = useState(false);

  const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Categories', href: '/admin/categories' },
    { title: `${category.name}` },
  ];

  const { data: productList, meta, links } = products;

  console.log(products);

  return (
    <>
      <AdminBreadcrumbs items={breadcrumbItems} />

      <div className="mt-4">
        <div className="flex items-center gap-x-2 border-b border-slate-400 pb-1 text-gray-900">
          <p className="font-bold lg:text-lg xl:text-xl">{category.name}</p>
        </div>

        <div className="mt-3 space-y-6">
          <AdminDetailCard title="ID">
            <p className="font-semibold">{category.id}</p>
          </AdminDetailCard>

          <AdminDetailCard title="Parent Category">
            {category.parent ? (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <CategoryCardLink category={category.parent} />
              </div>
            ) : (
              <span className="mt-1 text-sm font-semibold tracking-wider text-slate-400 uppercase">
                No parent found
              </span>
            )}
          </AdminDetailCard>

          <AdminDetailCard title="Children">
            {category.children.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.children.map((child) => (
                  <CategoryCardLink key={child.id} category={child} />
                ))}
              </div>
            ) : (
              <span className="mt-1 text-sm font-semibold tracking-wider text-slate-400 uppercase">
                No children found
              </span>
            )}
          </AdminDetailCard>

          <AdminDetailCard title="Products">
            {productList.length > 0 ? (
              <>
                <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {productList.map((product) => (
                    <ProductCardLink product={product} />
                  ))}
                </div>
                <Pagination meta={meta} type="advanced" className="mt-2" />
              </>
            ) : (
              <span className="mt-1 text-sm font-semibold tracking-wider text-slate-400 uppercase">
                No products found
              </span>
            )}
          </AdminDetailCard>
        </div>
      </div>
    </>
  );
};

CategoryShow.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default CategoryShow;
