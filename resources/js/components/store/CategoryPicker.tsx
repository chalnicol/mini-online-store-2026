import { useFilterSearch } from '@/context/FilterSearchContext';
import { cn } from '@/lib/utils';
import { Category } from '@/types/store';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';

const containsSelected = (
    category: Category,
    selectedId: number | null,
): boolean => {
    if (!selectedId) return false;
    if (category.id === selectedId) return true;
    return (
        category.children?.some((child) =>
            containsSelected(child, selectedId),
        ) ?? false
    );
};

const CategoryPickerBranch = ({
    category,
    selected,
    onSelect,
    isOpen,
    toggleOpen,
}: {
    category: Category;
    selected: number | null;
    onSelect: (category: Category) => void;
    isOpen: boolean;
    toggleOpen: () => void;
}) => {
    const hasChildren = category.children.length > 0;
    const contentRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    const [openChildId, setOpenChildId] = useState<number | null>(() => {
        const activeChild = category.children?.find((child) =>
            containsSelected(child, selected),
        );
        return activeChild ? activeChild.id : null;
    });

    useLayoutEffect(() => {
        if (!contentRef.current) return;

        if (isInitialMount.current) {
            gsap.set(contentRef.current, {
                height: isOpen ? 'auto' : 0,
                opacity: isOpen ? 1 : 0,
            });
            isInitialMount.current = false;
            return;
        }

        if (isOpen) {
            gsap.to(contentRef.current, {
                height: 'auto',
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out',
            });
        } else {
            gsap.to(contentRef.current, {
                height: 0,
                opacity: 0,
                duration: 0.2,
                ease: 'power2.in',
            });
        }
    }, [isOpen]);

    const handleToggleChild = (childId: number) => {
        setOpenChildId((prev) => (prev === childId ? null : childId));
    };

    const isSelected = category.id === selected;

    return (
        <div>
            <button
                className={cn(
                    'flex w-full cursor-pointer overflow-hidden rounded border border-gray-400 hover:bg-gray-100 disabled:cursor-default',
                    isSelected
                        ? 'bg-sky-900 font-bold text-white hover:bg-sky-800'
                        : '',
                    isOpen && !isSelected
                        ? 'bg-gray-200 font-semibold text-gray-700 hover:bg-gray-100'
                        : '',
                )}
                disabled={isSelected}
                onClick={() =>
                    hasChildren ? toggleOpen() : onSelect(category)
                }
            >
                <p className="flex-1 px-3 py-1 text-left">
                    {category.name}{' '}
                    {hasChildren && `(${category.children.length})`}
                </p>
                {hasChildren && (
                    <p className="flex flex-none items-center justify-center px-3">
                        <ChevronDown
                            size={16}
                            className={cn(
                                'transition-transform duration-300',
                                isOpen ? 'rotate-180' : '',
                            )}
                        />
                    </p>
                )}
            </button>

            <div ref={contentRef} className="overflow-hidden">
                {hasChildren && (
                    <div className="ms-1.5 space-y-2 border-s-2 border-gray-400 ps-2 pt-2">
                        {category.children.map((subCat) => (
                            <CategoryPickerBranch
                                key={subCat.id}
                                category={subCat}
                                selected={selected}
                                onSelect={onSelect}
                                isOpen={openChildId === subCat.id}
                                toggleOpen={() => handleToggleChild(subCat.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CategoryPicker = ({
    onSelect,
    selected,
    className,
}: {
    selected: number | null;
    onSelect: (category: Category) => void;
    className?: string;
}) => {
    const { categories } = useFilterSearch();

    const [openCategoryId, setOpenCategoryId] = useState<number | null>(() => {
        const activeTop = categories.find((cat) =>
            containsSelected(cat, selected),
        );
        return activeTop ? activeTop.id : null;
    });

    return (
        <div className={cn('space-y-2 bg-white px-4 py-2', className)}>
            <h2 className="text-lg font-bold">Select Category</h2>
            <div className="mb-2 max-h-[60dvh] space-y-2 overflow-y-auto bg-white">
                {categories.map((category) => (
                    <CategoryPickerBranch
                        key={category.id}
                        category={category}
                        selected={selected}
                        onSelect={onSelect}
                        isOpen={openCategoryId === category.id}
                        toggleOpen={() =>
                            setOpenCategoryId((prev) =>
                                prev === category.id ? null : category.id,
                            )
                        }
                    />
                ))}
            </div>
        </div>
    );
};

export default CategoryPicker;
