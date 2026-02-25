import useDebounce from '@/hooks/use-debounce';
import { useOutsideClick } from '@/hooks/user-outside-click';
import { cn } from '@/lib/utils';
import { Discount, ProductVariant } from '@/types/store';
import { sanitizeDateForInput } from '@/utils/DateUtils';
import { router, useForm } from '@inertiajs/react';
import { Check, Loader, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import BaseModal from '../../BaseModal';
import CustomButton from '../../CustomButton';
import InlineDatePicker from '../../InlineDatePicker';
import PromptMessage from '../../PromptMessage';
import TextInput from '../../TextInput';

const DiscountForm = ({ discount }: { discount?: Discount | null }) => {
    const [toAttachVariant, setToAttachVariant] = useState(false);

    const [attachedVariants, setAttachedVariants] = useState<ProductVariant[]>(
        discount?.variants || [],
    );
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<ProductVariant[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearch = useDebounce(search, 500);

    // Helper to get Tomorrow's date for 'Create' mode
    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    };

    const searchRef = useOutsideClick<HTMLDivElement>(() => {
        // setSearchResults([]);
        setSearch('');
        setIsSearching(false);
    });

    const {
        data,
        setData,
        processing,
        post,
        put,
        errors,
        setError, // Added to set manual validation errors
        hasErrors,
        clearErrors,
    } = useForm({
        code: discount?.code || '',
        type: discount?.type || 'fixed',
        value: discount?.value || 0,
        is_active: discount?.isActive || false,
        description: discount?.description || '',
        // Default to Tomorrow if creating
        start_date: discount?.startDate
            ? sanitizeDateForInput(discount.startDate)
            : getTomorrowDate(),
        end_date: discount?.endDate
            ? sanitizeDateForInput(discount.endDate)
            : getTomorrowDate(),
        // Extract IDs from the variants array or default to empty
        variant_ids: discount?.variants
            ? discount.variants.map((v: any) => v.id)
            : [],
    });

    const mode = discount ? 'edit' : 'create';

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearErrors();

        // 1. Validate End Date > Start Date
        if (data.end_date && data.end_date <= data.start_date) {
            setError('end_date', 'End date must be later than the start date.');
            return;
        }

        if (mode === 'create') {
            post('/admin/discounts');
        } else {
            put(`/admin/discounts/${discount?.id}`);
        }
    };

    const handleCancel = () => {
        router.visit('/admin/discounts');
    };

    // Fetch variants when debounced search changes
    useEffect(() => {
        if (!debouncedSearch.trim()) {
            setSearchResults([]);
            return;
        }

        const controller = new AbortController();
        const signal = controller.signal;

        const performSearch = async () => {
            setIsSearching(true);
            try {
                // Native fetch call
                const response = await fetch(
                    `/admin/discounts/search-variants?search=${encodeURIComponent(debouncedSearch)}`,
                    { signal },
                );
                if (!response.ok) throw new Error('Search failed');

                const results = await response.json();
                console.log('Search results:', results);
                setSearchResults(results);
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error('Search error:', err);
                }
            } finally {
                setIsSearching(false);
            }
        };

        performSearch();

        // Cleanup function: cancels the fetch if the user types again immediately
        return () => controller.abort();
    }, [debouncedSearch]);

    const handleRemoveAttachedVariant = (id: number) => {
        //..
        setAttachedVariants(attachedVariants.filter((v) => v.id !== id));
        setData(
            'variant_ids',
            attachedVariants.filter((v) => v.id !== id),
        );
    };

    const isSelected = (id: number) => {
        // return data.variant_ids.includes(id);
        return attachedVariants.some((v) => v.id === id);
    };

    const handleSearchResultsClick = (variant: ProductVariant) => {
        //.
        if (!isSelected(variant.id)) {
            setData('variant_ids', [...data.variant_ids, variant.id]);
            setAttachedVariants([...attachedVariants, variant]);
        } else {
            handleRemoveAttachedVariant(variant.id);
        }
    };

    const searchResultsWindowOpen = debouncedSearch.length > 0;

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

                <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-[1fr_1fr]">
                    <div className="space-y-4">
                        {/* type */}
                        <div className="space-y-1.5">
                            <p className="text-[10px] tracking-widest uppercase">
                                Type
                            </p>
                            <div className="grid grid-cols-2 divide-x divide-gray-400 rounded border border-gray-400">
                                <button
                                    type="button"
                                    className="cursor-pointer rounded-s bg-gray-200 py-0.5 font-semibold text-gray-600 shadow transition-colors duration-300 hover:bg-gray-100 disabled:pointer-events-none disabled:cursor-default disabled:bg-sky-900 disabled:text-white disabled:shadow-none"
                                    disabled={data.type === 'fixed'}
                                    onClick={() => setData('type', 'fixed')}
                                >
                                    Fixed
                                </button>
                                <button
                                    type="button"
                                    className="cursor-pointer rounded-e bg-gray-200 py-0.5 font-semibold text-gray-600 shadow transition-colors duration-300 hover:bg-gray-100 disabled:pointer-events-none disabled:cursor-default disabled:bg-sky-900 disabled:text-white disabled:shadow-none"
                                    disabled={data.type === 'percentage'}
                                    onClick={() =>
                                        setData('type', 'percentage')
                                    }
                                >
                                    Percentage
                                </button>
                            </div>
                        </div>

                        <TextInput
                            label="Code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Value"
                            value={data.value}
                            onChange={(e) => setData('value', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            required
                        />
                        {/* Start Date */}
                        <div className="space-y-1.5">
                            <p className="text-[10px] tracking-widest uppercase">
                                Start Date
                            </p>
                            <InlineDatePicker
                                value={data.start_date}
                                onChange={(date) => setData('start_date', date)}
                                // error={errors.start_date}
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-1.5">
                            <p className="text-[10px] tracking-widest uppercase">
                                End Date
                            </p>
                            <InlineDatePicker
                                value={data.end_date}
                                onChange={(date) => setData('end_date', date)}
                                // error={errors.end_date}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {/* Variants Attached */}
                        <div className="space-y-1.5">
                            <p className="text-[10px] tracking-widest uppercase">
                                Variants
                            </p>

                            <div className="divide-y divide-gray-300 rounded border border-gray-400 bg-white">
                                <div className="p-2">
                                    <CustomButton
                                        type="button"
                                        label="Attach Product Variants"
                                        // size="sm"
                                        color="primary"
                                        onClick={() => setToAttachVariant(true)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="h-30 overflow-y-auto">
                                    {attachedVariants.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2 lg:grid-cols-3">
                                            {attachedVariants.map((v) => (
                                                <div
                                                    key={v.id}
                                                    className="flex divide-x divide-gray-400 overflow-hidden rounded border border-gray-400 bg-gray-200 text-gray-600 shadow"
                                                >
                                                    <div className="flex-1 px-2 py-1 text-sm font-bold">
                                                        <p>
                                                            {v.product?.name ||
                                                                'Product'}
                                                        </p>
                                                        <p className="text-xs font-semibold text-slate-400">
                                                            {v.name}
                                                        </p>
                                                    </div>
                                                    <button
                                                        className="flex-none cursor-pointer px-1 hover:bg-gray-100"
                                                        onClick={() =>
                                                            handleRemoveAttachedVariant(
                                                                v.id,
                                                            )
                                                        }
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                                            No variants attached
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-x-1.5">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData('is_active', e.target.checked)
                                }
                                className="aspect-square w-4 rounded border border-gray-400 px-2 py-1 accent-sky-900 outline-none focus:ring-1 focus:ring-sky-900"
                            />
                            <label
                                htmlFor="is_active"
                                className="text-[10px] tracking-widest uppercase"
                            >
                                Is Active
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-x-2">
                    <CustomButton
                        type="button"
                        label="Cancel"
                        color="secondary"
                        disabled={processing}
                        onClick={handleCancel}
                    />
                    <CustomButton
                        type="submit"
                        label={mode === 'create' ? 'Create' : 'Update'}
                        color="primary"
                        disabled={processing}
                        loading={processing}
                    />
                </div>
            </form>

            {toAttachVariant && (
                <BaseModal size="lg">
                    <div className="flex justify-end">
                        <button
                            className="cursor-pointer rounded-t bg-sky-900 px-2 py-0.5 text-xs text-white hover:bg-sky-800"
                            onClick={() => setToAttachVariant(false)}
                        >
                            CLOSE
                        </button>
                    </div>
                    <div className="rounded rounded-tr-none border border-gray-400 bg-white p-3 shadow-lg">
                        <p className="mb-2 text-lg font-bold">
                            Attach Variants
                        </p>
                        <div className="space-y-2">
                            <input
                                autoFocus
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded border border-gray-400 bg-white px-2 py-1 outline-none focus:ring-1 focus:ring-sky-900"
                                placeholder="Search by product name or SKU..."
                            />
                            <div className="h-38 w-full overflow-y-auto rounded border border-gray-400 bg-white">
                                {isSearching ? (
                                    <div className="flex h-full w-full items-center justify-center gap-x-2 p-4 text-sm text-gray-400">
                                        <Loader
                                            size={20}
                                            className="animate-spin"
                                        />
                                        <p>Searching..</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="divide-y divide-gray-300">
                                        {searchResults.map((variant) => {
                                            const isSelected =
                                                attachedVariants.some(
                                                    (v) => v.id === variant.id,
                                                );

                                            //..
                                            return (
                                                <div
                                                    key={variant.id}
                                                    onClick={() =>
                                                        handleSearchResultsClick(
                                                            variant,
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex cursor-pointer items-center justify-between p-2 transition-colors hover:bg-sky-50',
                                                        isSelected &&
                                                            'bg-sky-100',
                                                    )}
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 uppercase">
                                                            {variant?.product
                                                                ? variant
                                                                      .product
                                                                      .name
                                                                : 'Product'}
                                                        </p>
                                                        <p className="text-[11px] text-gray-600">
                                                            {variant.name}{' '}
                                                            &bull; {variant.sku}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <span>
                                                            <Check
                                                                size={16}
                                                                className="text-sky-900"
                                                            />
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        {debouncedSearch.length > 0 ? (
                                            <p>
                                                No variants found for{' '}
                                                <span className="font-bold">
                                                    "{search}"
                                                </span>
                                            </p>
                                        ) : (
                                            <p>Results will appear here...</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </BaseModal>
            )}
        </>
    );
};

export default DiscountForm;
