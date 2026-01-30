import { useFilterSearch } from '@/context/FilterSearchContext';
import gsap from 'gsap';
import { List } from 'lucide-react';
import { useEffect, useRef } from 'react';
import CategoryList from './CategoryList';

const FilterSearch: React.FC = () => {
    const { isCategoryListOpen, showCategoryList, searchTerm, setSearched } =
        useFilterSearch();
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

    // 1. Unified Close Logic: Animate THEN update state
    const handleClose = () => {
        const tl = gsap.timeline({
            onComplete: () => showCategoryList(false), // Remove from DOM only when done
        });

        tl.to(itemsRef.current[0], {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
        }).to(
            itemsRef.current[1],
            {
                xPercent: -100, // Slide back out
                duration: 0.3,
                ease: 'power2.in',
            },
            '<',
        ); // Start at the same time as the fade
    };

    // 2. Open Animation Logic
    useEffect(() => {
        const tl = gsap.timeline();

        if (isCategoryListOpen) {
            // Clear any previous inline styles to prevent conflicts
            gsap.set(itemsRef.current[0], { clearProps: 'all' });
            gsap.set(itemsRef.current[1], { clearProps: 'all' });

            tl.from(itemsRef.current[0], {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.out',
            }).from(
                itemsRef.current[1],
                {
                    xPercent: -100,
                    duration: 0.4,
                    ease: 'power4.out',
                },
                '-=0.2',
            );

            // return () => {
            //     tl.kill();
            // };
        }
        return () => {
            tl.kill();
        };
    }, [isCategoryListOpen]);

    return (
        <div className="mt-4 flex gap-x-1.5 md:gap-x-2">
            <button
                className="flex flex-none cursor-pointer items-center gap-x-1 rounded bg-sky-900 px-3 py-1 font-semibold text-white hover:bg-sky-800 sm:px-4"
                onClick={() => showCategoryList(true)}
            >
                <List size={16} />
                <span className="hidden sm:inline">Categories</span>
            </button>

            <input
                type="search"
                placeholder="Search Products"
                value={searchTerm}
                onChange={(e) => setSearched(e.target.value)}
                className="w-full rounded border border-gray-400 bg-white px-3 py-1 focus:ring-1 focus:ring-sky-800 focus:outline-none lg:text-lg"
            />

            {isCategoryListOpen && (
                <div className="fixed inset-0 z-40 mt-[56px] h-[calc(100dvh-56px)] w-full overflow-hidden">
                    {/* Background Overlay */}
                    <div
                        ref={(el) => {
                            itemsRef.current[0] = el;
                        }}
                        className="absolute inset-0 bg-gray-500/70"
                        onClick={handleClose} // Click overlay to close
                    ></div>

                    {/* Sidebar Content */}
                    <div
                        ref={(el) => {
                            itemsRef.current[1] = el;
                        }}
                        className="relative h-full w-full max-w-[300px] overflow-y-auto bg-white shadow-xl"
                    >
                        <div className="flex items-center justify-between bg-gray-200 p-3">
                            <span className="font-bold text-gray-500">
                                Categories
                            </span>
                            <button
                                onClick={handleClose}
                                className="cursor-pointer rounded border border-gray-400 px-1 text-xs text-gray-400 shadow hover:bg-gray-100 hover:text-gray-600"
                            >
                                close
                            </button>
                        </div>
                        <div className="p-3">
                            <CategoryList />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterSearch;
