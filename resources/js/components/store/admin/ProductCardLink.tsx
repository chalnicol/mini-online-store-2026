import { cn } from '@/lib/utils';
import { Product } from '@/types/store';
import { Link } from '@inertiajs/react';
import Rating from '../Rating';

const ProductCardLink = ({ product: item }: { product: Product }) => {
  return (
    <Link
      key={item.id}
      href={`/admin/products/${item.id}`}
      className="overflow-hidden rounded border border-gray-400 shadow hover:shadow-md"
    >
      {/* <p className="flex min-w-10 flex-shrink-0 items-center justify-center rounded bg-gray-300 p-0.5 px-2 text-center text-xs font-bold tracking-widest text-gray-700">
                                    {item.id < 10 ? `0${item.id}` : item.id}
                                </p> */}
      <div className="flex gap-2 p-2">
        <div className="flex-1 space-y-1">
          <p className="font-bold text-gray-600">{item.name}</p>

          <div className="flex items-center gap-x-1.5">
            <p className="min-w-6 bg-gray-300 px-2 text-center text-[10px] font-bold text-gray-600">
              {item.variantsCount}
            </p>
            <Rating rating={item.averageRating} size="sm" />
          </div>
        </div>
        <div className="flex flex-none flex-col gap-1">
          {/* <p className="flex aspect-square items-center justify-center border-gray-300 bg-sky-900 px-1 text-[10px] font-bold tracking-wider text-white">
                                            {item.variantsCount}
                                        </p> */}
          <p className={cn('aspect-square w-2 rounded-full', item.isPublished ? 'bg-emerald-600' : 'bg-rose-600')}></p>
        </div>
      </div>
      <div className="border-t border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-gray-600">
        ID:
        {item.id < 10 ? `0${item.id}` : item.id}
      </div>
    </Link>
  );
};

export default ProductCardLink;
