import { useFilterSearch } from '@/context/FilterSearchContext';
import type { Category } from '@/types/store';
import { ChevronDown } from 'lucide-react';
import { useMemo, useRef } from 'react';

const CategoryBranch: React.FC<{
    category: Category;
}> = ({ category }) => {
    const subContRef = useRef<HTMLDivElement>(null);
    const { selectedCategorySlug, setSelectedSlug, expandedId, setExpanded } =
        useFilterSearch();

    const isSelected = category.slug === selectedCategorySlug;
    const hasSub = category.children && category.children.length > 0;

    // 1. Check if the current ID is the one the user clicked
    const isDirectlyExpanded = expandedId === category.id;

    // 2. RECURSIVE CHECK: Is the expandedId a descendant of this category?
    const isParentOfExpanded = useMemo(() => {
        if (!expandedId || !category.children) return false;

        const checkChildren = (children: Category[]): boolean => {
            return children.some(
                (child) =>
                    child.id === expandedId ||
                    (child.children && checkChildren(child.children)),
            );
        };

        return checkChildren(category.children);
    }, [expandedId, category.children]);

    // 3. Final Expanded State
    const isExpanded = isDirectlyExpanded || isParentOfExpanded;

    const handleToggleExpandClick = () => {
        if (isExpanded) {
            // If we are a child, we should probably set the expandedId to our parent
            // but for a simple accordion, setting to null or parent ID works.
            setExpanded(category.parentId || null);
        } else {
            setExpanded(category.id);
        }
    };
    const handleTextClick = () => {
        if (isExpanded) {
            // setIsExpanded(false);
            setExpanded(null);
        }
        if (selectedCategorySlug === category.slug) {
            setSelectedSlug(null);
        } else {
            setSelectedSlug(category.slug);
        }
    };

    const contClass = () => {
        if (isSelected) {
            return 'border-gray-200 bg-sky-900 text-white';
        } else if (isExpanded && !isSelected) {
            return 'border-gray-400 bg-gray-200 text-gray-600';
        }
        return 'border-gray-400 bg-white text-gray-600';
    };

    return (
        <div className="flex w-full flex-col">
            <div
                className={`flex items-stretch overflow-hidden rounded border ${contClass()}`}
            >
                {/* 1. THE LINK: Changes products, does NOT toggle tree */}
                <button
                    type="button"
                    onClick={handleTextClick}
                    className="flex-1 cursor-pointer rounded px-3 py-1.5 text-left text-sm font-semibold hover:bg-black/10"
                >
                    {category.name}
                </button>

                {/* 2. THE TOGGLE: Changes tree, does NOT change products */}
                {hasSub && (
                    <button
                        type="button"
                        onClick={handleToggleExpandClick}
                        className="flex w-10 flex-none cursor-pointer items-center justify-center border-s border-inherit hover:bg-black/10"
                    >
                        <ChevronDown
                            size={14}
                            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                )}
            </div>

            {isExpanded && hasSub && (
                <div className="ms-1 mt-2 space-y-2 border-s-3 border-sky-900 ps-2">
                    {category.children.map((sub) => (
                        <CategoryBranch key={sub.id} category={sub} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryBranch;
