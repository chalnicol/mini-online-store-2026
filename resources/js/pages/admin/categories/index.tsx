import CategoryListingBranch from '@/components/store/admin/CategoryListingBranch';
import CustomButton from '@/components/store/CustomButton';
import MenuOptions from '@/components/store/MenuOptions';
import PromptMessage from '@/components/store/PromptMessage';
import { CategoryManagementProvider } from '@/context/CategoryManagementContext';
import AdminLayout from '@/layouts/admin/layout';
import { Category, OptionDetails } from '@/types/store';
import { useForm } from '@inertiajs/react';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';

const CategoryListing = ({ allCategories }: { allCategories: Category[] }) => {
    const [createNew, setCreateNew] = useState(false);

    const {
        data,
        setData,
        errors,
        hasErrors,
        reset,
        clearErrors,
        post,
        processing,
    } = useForm({
        name: '',
        parentId: null,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/admin/categories', {
            replace: true,
            preserveScroll: true,
            onBefore: () => clearErrors(),
            onSuccess: () => {
                resetCreateForm();
            },
        });
    };

    const categoriesOptions: OptionDetails[] = [
        { label: 'Create New Category', value: 'create' },
    ];
    const handleOptionsClick = (value: number | string | null) => {
        if (value == 'create') {
            setCreateNew(true);
        }
    };
    const resetCreateForm = () => {
        setCreateNew(false);
        reset();
        clearErrors();
    };
    const nameRef = useRef<HTMLInputElement>(null);
    const contRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (createNew && contRef.current) {
            gsap.fromTo(
                contRef.current,
                {
                    scale: 0.9,
                },
                {
                    scale: 1,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.6)',
                    onComplete: () => {
                        nameRef.current?.focus();
                    },
                },
            );
        }
        return () => {
            if (contRef.current) {
                gsap.killTweensOf(contRef.current);
            }
        };
    }, [createNew]);

    return (
        <>
            {/* <TitleBar title="Categories" className="mb-3" /> */}
            <div className="flex items-center justify-between border-b border-gray-400 py-1">
                <h2 className="text-lg font-bold text-gray-900">Categories</h2>
                <MenuOptions
                    pageOptions={categoriesOptions}
                    onOptionsClick={handleOptionsClick}
                />
            </div>

            <div className="max-w-2xl space-y-2">
                {createNew && (
                    <div
                        ref={contRef}
                        className="my-3 space-y-1 overflow-hidden rounded border border-gray-400 px-3 py-2 shadow"
                    >
                        <p className="text-sm font-bold">Create New</p>

                        {hasErrors && (
                            <PromptMessage
                                type="error"
                                message={errors.name}
                                className="my-2"
                            />
                        )}

                        <form
                            className="flex items-start gap-x-2"
                            onSubmit={handleSubmit}
                        >
                            <input
                                ref={nameRef}
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                                placeholder="input name here"
                                className="flex-1 rounded border border-gray-400 px-2 py-1 outline-none focus:ring-1 focus:ring-sky-900"
                            />

                            <CustomButton
                                type="button"
                                label="Cancel"
                                color="secondary"
                                disabled={processing}
                                onClick={resetCreateForm}
                            />

                            <CustomButton
                                label="Submit"
                                color="primary"
                                type="submit"
                                disabled={processing || !data.name}
                                loading={processing}
                            />
                        </form>
                    </div>
                )}
                <div className="my-3 max-h-[65dvh] space-y-2 overflow-y-auto pb-2">
                    <CategoryManagementProvider>
                        {allCategories.map((category) => (
                            <CategoryListingBranch
                                key={category.id}
                                category={category}
                            />
                        ))}
                    </CategoryManagementProvider>
                </div>
            </div>
        </>
    );
};

CategoryListing.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default CategoryListing;
