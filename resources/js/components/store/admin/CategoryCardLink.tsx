import { cn } from '@/lib/utils';
import { Category } from '@/types/store';
import { Link } from '@inertiajs/react';

const CategoryCardLink = ({ category: item, className }: { category: Category; className?: string }) => {
  return (
    <Link
      key={item.id}
      href={`/admin/categories/${item.id}`}
      className={cn('overflow-hidden rounded border border-gray-400 shadow hover:shadow-md', className)}
    >
      {/* <p className="flex min-w-10 flex-shrink-0 items-center justify-center rounded bg-gray-300 p-0.5 px-2 text-center text-xs font-bold tracking-widest text-gray-700">
                                    {item.id < 10 ? `0${item.id}` : item.id}
                                </p> */}
      <div className="flex gap-2 p-2">
        <div className="flex-1 space-y-1">
          <p className="font-bold text-gray-600">{item.name}</p>
        </div>
        <div className="flex flex-none flex-col gap-1">
          <p className={cn('aspect-square w-2 rounded-full', item.isActive ? 'bg-emerald-600' : 'bg-rose-600')}></p>
        </div>
      </div>
      <div className="border-t border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-gray-600">
        ID:
        {item.id < 10 ? `0${item.id}` : item.id}
      </div>
    </Link>
  );
};

export default CategoryCardLink;
