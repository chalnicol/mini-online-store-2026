import { cn } from '@/lib/utils';
import { Category, Product } from '@/types/store';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import BaseModal from './BaseModal';
import CategoryPicker from './CategoryPicker';
import CustomButton from './CustomButton';
import PromptMessage from './PromptMessage';

const ProductForm = ({ product }: { product?: Product | null }) => {
    // const { categories } = useFilterSearch();
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const {
        data,
        setData,
        processing,
        post,
        put,
        errors,
        hasErrors,
        clearErrors,
    } = useForm({
        name: product?.name || '',
        description: product?.description || '',
        category_id: product?.category ? product.category.id : null,
        is_published: product?.isPublished || false,
    });

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        product ? product.category : null,
    );

    const mode = product ? 'edit' : 'create';

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //..
        if (mode == 'create') {
            post('/admin/products', {
                replace: true,
                onBefore: () => clearErrors(),
            });
        } else if (mode == 'edit') {
            if (!product) return;

            put(`/admin/products/${product.id}`, {
                replace: true,
                onBefore: () => clearErrors(),
            });
        }
    };

    const handleCancel = () => {
        //..
        router.visit('/admin/products');
    };

    const handleCategorySelect = (c: Category) => {
        setSelectedCategory(c);
        setData('category_id', c.id);
        setShowCategoryPicker(false);
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                {hasErrors && (
                    <PromptMessage
                        type="error"
                        errors={errors}
                        className="my-3"
                    />
                )}

                <div className="flex-1 space-y-3">
                    <div className="flex flex-col space-y-1 text-sm">
                        <label
                            htmlFor="name"
                            className="text-[10px] tracking-widest uppercase"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            className="rounded border border-gray-400 px-2 py-1 outline-none focus:ring-1 focus:ring-sky-900"
                        />
                    </div>

                    <div className="flex flex-col space-y-1 text-sm">
                        <label
                            htmlFor="name"
                            className="text-[10px] tracking-widest uppercase"
                        >
                            Category
                        </label>
                        <button
                            type="button"
                            className={cn(
                                'flex overflow-hidden rounded border border-gray-400 outline-none focus:ring-1 focus:ring-sky-900',
                                showCategoryPicker ? 'ring-1 ring-sky-900' : '',
                            )}
                            onClick={() => setShowCategoryPicker(true)}
                        >
                            <p className="flex-1 px-2 py-1 text-left">
                                {selectedCategory
                                    ? selectedCategory.name
                                    : '-none selected-'}
                            </p>
                            <p className="flex cursor-pointer items-center justify-center border-s bg-gray-200 px-3 font-bold text-gray-600 hover:bg-gray-100">
                                {selectedCategory ? 'Change' : 'Select'}
                            </p>
                        </button>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <label
                            htmlFor="description"
                            className="text-[10px] tracking-widest uppercase"
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            // required
                            rows={4}
                            className="rounded border border-gray-400 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-sky-900"
                        />
                    </div>

                    <div className="flex items-center gap-x-1.5">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={data.is_published}
                            onChange={(e) =>
                                setData('is_published', e.target.checked)
                            }
                            className="aspect-square w-4 rounded border border-gray-400 px-2 py-1 accent-sky-900 outline-none focus:ring-1 focus:ring-sky-900"
                        />
                        <label
                            htmlFor="is_published"
                            className="text-[10px] tracking-widest uppercase"
                        >
                            Is Published
                        </label>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-x-2">
                    <CustomButton
                        type="button"
                        label="Cancel"
                        color="secondary"
                        disabled={processing}
                        onClick={handleCancel}
                    />
                    <CustomButton
                        type="submit"
                        label={mode == 'create' ? 'Create' : 'Update'}
                        color="primary"
                        disabled={processing}
                        loading={processing}
                    />
                </div>
            </form>

            {showCategoryPicker && (
                <BaseModal>
                    <div className="flex justify-end">
                        <button
                            className="cursor-pointer rounded-t bg-sky-900 px-3 py-0.5 text-xs tracking-wider text-white uppercase hover:bg-sky-800"
                            onClick={() => setShowCategoryPicker(false)}
                        >
                            CLOSE
                        </button>
                    </div>
                    <CategoryPicker
                        onSelect={handleCategorySelect}
                        selected={selectedCategory?.id || null}
                        className="rounded rounded-tr-none"
                    />
                </BaseModal>
            )}
        </>
    );
};

export default ProductForm;
