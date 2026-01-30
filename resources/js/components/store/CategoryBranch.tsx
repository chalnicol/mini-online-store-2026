import { useFilterSearch } from '@/context/FilterSearchContext';
import type { Category } from '@/types/store';
import gsap from 'gsap';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const CategoryBranch: React.FC<{ category: Category }> = ({ category }) => {
    const subContRef = useRef<HTMLDivElement>(null);
    const { selectedCategorySlug, setSelectedSlug, activePath } =
        useFilterSearch();

    const isSelected = category.slug === selectedCategorySlug;
    const hasSub = category.children && category.children.length > 0;

    // --- THE SECRET SAUCE ---
    // We only want 'activePath' to open the tree on the INITIAL mount (refresh).
    // After that, the user has full manual control via this local state.
    const [isExpanded, setIsExpanded] = useState(() =>
        activePath.includes(category.id),
    );

    // GSAP Animation
    useEffect(() => {
        if (!subContRef.current) return;
        if (isExpanded) {
            gsap.fromTo(
                subContRef.current,
                { height: 0, opacity: 0 },
                {
                    height: 'auto',
                    opacity: 1,
                    duration: 0.3,
                    ease: 'power2.out',
                },
            );
        } else {
            gsap.to(subContRef.current, {
                height: 0,
                opacity: 0,
                duration: 0.2,
                ease: 'power2.in',
            });
        }
    }, [isExpanded]);

    return (
        <div className="flex w-full flex-col">
            <div
                className={`flex items-stretch rounded border transition-all ${
                    isSelected
                        ? 'border-sky-900 bg-sky-900 text-white'
                        : 'border-gray-400 bg-white text-gray-900'
                }`}
            >
                {/* 1. THE LINK: Changes products, does NOT toggle tree */}
                <button
                    type="button"
                    onClick={() =>
                        setSelectedSlug(isSelected ? null : category.slug)
                    }
                    className="flex-1 px-3 py-1.5 text-left text-sm font-semibold hover:bg-black/5"
                >
                    {category.name}
                </button>

                {/* 2. THE TOGGLE: Changes tree, does NOT change products */}
                {hasSub && (
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex w-10 flex-none items-center justify-center border-s border-inherit hover:bg-black/5"
                    >
                        <ChevronDown
                            size={14}
                            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                )}
            </div>

            {/* 3. THE CHILDREN */}
            <div
                ref={subContRef}
                className="overflow-hidden"
                style={{
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0,
                }}
            >
                {hasSub && (
                    <div className="ms-1 mt-2 space-y-2 border-s-3 border-sky-900 ps-2">
                        {category.children.map((sub) => (
                            <CategoryBranch key={sub.id} category={sub} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryBranch;
