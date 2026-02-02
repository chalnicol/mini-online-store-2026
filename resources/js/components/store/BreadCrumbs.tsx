import { useFilterSearch } from '@/context/FilterSearchContext';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

interface BreadCrumbsProps {
    name: string;
    categoryId: number;
}
const BreadCrumbs: React.FC<BreadCrumbsProps> = ({ name, categoryId }) => {
    const { getBreadcrumbs } = useFilterSearch();

    const categoryChain = getBreadcrumbs(categoryId);
    // console.log(categoryChain);
    return (
        <div className="my-2 mt-3 flex flex-wrap items-center gap-x-2 rounded bg-gray-200 px-3 py-2.5 font-bold text-gray-500">
            <Link href="/" className="cursor-pointer text-sm hover:underline">
                Home
            </Link>

            {categoryChain.map((cat) => (
                <div
                    key={cat.id}
                    className="flex flex-none items-center gap-x-2"
                >
                    <ChevronRight size={12} />
                    <Link
                        href={`/?category=${cat.slug}`}
                        className="cursor-pointer text-sm hover:underline"
                    >
                        {cat.name}
                    </Link>
                </div>
            ))}

            <ChevronRight size={12} />
            <span className="text-sm font-semibold">{name}</span>
        </div>
    );
};

export default BreadCrumbs;
