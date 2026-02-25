import MenuOptions from '@/components/store/MenuOptions';
import { useCategoryManagement } from '@/context/CategoryManagementContext';
import { cn } from '@/lib/utils';
import { Category, OptionDetails } from '@/types/store';
import { useEffect, useMemo, useRef, useState } from 'react';
import CustomButton from '../CustomButton';
import CategoryForm from './forms/CategoryForm';

const CategoryListingBranch = ({ category }: { category: Category }) => {
    const {
        toAddId,
        toEditId,
        toMoveId,
        toDeleteId,
        setAddId,
        setEditId,
        setMoveId,
        setDeleteId,
        updateCategory,
        moveCategory,
        deleteCategory,
        createCategory,
        moveToTopLevel,
        loading,
        error,
        clearError,
        reset,
    } = useCategoryManagement();

    const hasChildren = category.children.length > 0;

    const [isOpen, setIsOpen] = useState(false);

    const generatedOptions = useMemo(() => {
        // 1. Start with options that are ALWAYS present
        const options: OptionDetails[] = [
            { label: 'Edit Category', value: 'edit' },
        ];

        // 2. Only show "Move Category" if it's NOT the item currently being moved
        const isBeingMoved = toMoveId && toMoveId === category.id;

        if (!isBeingMoved) {
            options.push({ label: 'Move Category', value: 'move' });
        } else {
            // If it IS being moved, show "Cancel Move" at the top
            options.unshift({ label: 'Cancel Move', value: 'cancel-move' });
        }

        // 3. Handle the rest of the conditional logic
        if (category.parentId !== null) {
            options.push({ label: 'Move to Top Level', value: 'move-top' });
        }

        if (!hasChildren) {
            options.push({ label: 'Delete Category', value: 'delete' });
        }

        // Only show "Drop" if a move is in progress and it's a different category
        if (toMoveId && !isBeingMoved) {
            options.push({ label: 'Drop Category', value: 'drop' });
        }

        options.push({ label: 'Add New Subcategory', value: 'add' });

        return options;
    }, [hasChildren, toMoveId, category.id, category.parentId]);

    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewChanged = isOpen || toDeleteId == category.id;
        if (viewChanged && itemRef.current) {
            itemRef.current.scrollIntoView({
                behavior: 'smooth', // Smooth animation
                block: 'nearest', // Don't jump the whole page, just show the element
            });
        }
    }, [isOpen, toDeleteId, category.id]);

    useEffect(() => {
        if (isOpen && !toAddId && !hasChildren) {
            setIsOpen(false);
        }
    }, [hasChildren, toAddId, isOpen]);

    const handleOptionClick = (value: number | string | null) => {
        switch (value) {
            case 'edit':
                setMoveId(null);
                setEditId(category.id);
                break;
            case 'add':
                setMoveId(null);
                setIsOpen(true);
                setAddId(category.id);
                break;
            case 'move':
                setMoveId(category.id);
                break;
            case 'move-top':
                setMoveId(null);
                moveToTopLevel(category.id);
                break;
            case 'drop':
                moveCategory(category.id);
                break;
            case 'delete':
                setMoveId(null);
                setDeleteId(category.id);
                break;
            case 'cancel-move':
                setMoveId(null);
                break;
            default:
                break;
        }
    };

    const handleButtonClick = () => {
        if (!hasChildren) return;
        setIsOpen((prev) => !prev);
    };

    if (toEditId == category.id) {
        return (
            <div>
                <CategoryForm
                    categoryName={category.name}
                    onSubmit={(name) => updateCategory(name)}
                    onCancel={() => {
                        setEditId(null);
                        clearError();
                    }}
                    loading={loading}
                    error={error}
                />
            </div>
        );
    }

    if (toDeleteId == category.id) {
        return (
            <div
                ref={itemRef}
                className="flex flex-col justify-between gap-2 rounded border border-rose-400 px-2.5 py-1.5 shadow sm:flex-row sm:items-center"
            >
                <p className="flex-1 font-semibold text-rose-600">
                    {category.name}
                </p>

                <div className="flex items-center gap-x-2 border-t border-gray-300 pt-1.5 sm:border-0 sm:pt-0">
                    <p className="text-sm font-semibold text-rose-400">
                        Confirm delete?
                    </p>

                    <div className="flex items-center gap-x-1.5">
                        <CustomButton
                            label="No"
                            color="secondary"
                            size="xs"
                            onClick={() => setDeleteId(null)}
                            disabled={loading}
                            className="min-w-14"
                        />
                        <CustomButton
                            label="Yes"
                            color="danger"
                            size="xs"
                            onClick={() => deleteCategory(category.id)}
                            disabled={loading}
                            loading={loading}
                            className="min-w-14"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={itemRef}>
            <div
                className={cn(
                    'group flex justify-between rounded border border-gray-400 shadow',
                    toMoveId == category.id && 'border-sky-600 text-sky-600',
                )}
            >
                <button
                    className={cn(
                        'flex flex-1 items-center gap-x-1.5 rounded-s px-2.5 py-1.5 text-left font-semibold',
                        hasChildren
                            ? 'cursor-pointer group-hover:bg-gray-100'
                            : '',
                        isOpen ? 'bg-gray-200' : '',
                    )}
                    onClick={handleButtonClick}
                >
                    {hasChildren && (
                        <p className="flex min-w-7 items-center justify-center rounded border border-gray-300 bg-sky-900 px-1.5 text-xs text-white">
                            {category.children.length}
                        </p>
                    )}
                    <span>{category.name}</span>
                </button>

                <div
                    className={cn(
                        'flex items-center justify-center rounded-e px-1.5',
                        hasChildren ? 'group-hover:bg-gray-100' : '',
                        isOpen ? 'bg-gray-200' : '',
                    )}
                >
                    <MenuOptions
                        pageOptions={generatedOptions}
                        onOptionsClick={handleOptionClick}
                        optionsPosition="auto"
                    />
                </div>
            </div>

            {isOpen && (
                <div className="ms-1.5 space-y-2 border-s-2 border-gray-400 ps-2 pt-2">
                    {toAddId == category.id && (
                        <CategoryForm
                            onSubmit={(name) => createCategory(name)}
                            onCancel={() => {
                                setAddId(null);
                                clearError();
                                if (!hasChildren) setIsOpen(false);
                            }}
                            loading={loading}
                            error={error}
                        />
                    )}
                    {hasChildren && (
                        <>
                            {category.children.map((subCat) => (
                                <CategoryListingBranch
                                    key={subCat.id}
                                    category={subCat}
                                />
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoryListingBranch;
