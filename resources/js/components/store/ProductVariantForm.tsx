import { AVAILABLE_ATTRIBUTE_KEYS } from '@/data';
import { ProductVariant } from '@/types/store';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import CustomButton from './CustomButton';
import PromptMessage from './PromptMessage';
import TextInput from './TextInput';

const ProductVariantForm = ({
    variant,
    productId,
}: {
    productId?: number | null;
    variant?: ProductVariant | null;
}) => {
    // const [preview, setPreview] = useState<string | null>(
    //     variant?.imagePath || null,
    // );
    const [preview, setPreview] = useState<string | null>(
        variant?.imagePath ? `/storage/${variant.imagePath}` : null,
    );

    const {
        data,
        setData,
        put,
        post,
        processing,
        errors,
        hasErrors,
        clearErrors,
    } = useForm({
        name: variant?.name || '',
        // If no attributes exist, start with an empty object {} instead of {'':''}
        attributes:
            variant?.attributes && Object.keys(variant.attributes).length > 0
                ? variant.attributes
                : {},
        image: null as File | null,
        is_active: variant?.isActive ?? true,
        product_id: productId || null,
    });

    // Helper to see which keys are already chosen
    const selectedKeys = Object.keys(data.attributes);

    const mode = variant ? 'edit' : 'create';

    // --- Attribute Logic ---
    const handleAttributeKeyChange = (oldKey: string, newKey: string) => {
        const newAttrs = { ...data.attributes };
        const value = newAttrs[oldKey];
        delete newAttrs[oldKey];
        newAttrs[newKey] = value;
        setData('attributes', newAttrs);
    };

    const handleAttributeValueChange = (key: string, value: string) => {
        setData('attributes', { ...data.attributes, [key]: value });
    };

    const addAttribute = () =>
        setData('attributes', { ...data.attributes, '': '' });

    const removeAttribute = (key: string) => {
        const newAttrs = { ...data.attributes };
        delete newAttrs[key];
        // REMOVED: if (Object.keys(newAttrs).length === 0) newAttrs[''] = '';
        // Let it be empty so the backend receives null
        setData('attributes', newAttrs);
    };

    // --- Image Logic ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        return () => {
            if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanAttributes = Object.fromEntries(
            Object.entries(data.attributes).filter(
                ([k, v]) => k.trim() !== '' && v.trim() !== '',
            ),
        );

        const payload = {
            ...data,
            attributes: cleanAttributes, // This will be {} if empty
        };

        if (mode === 'create') {
            // Syntax: post(url, options) -> This uses the internal 'data' state
            // To use the 'payload', we pass it as the second argument
            post('/admin/products/variants', {
                ...payload, // Pass data directly here
                forceFormData: true,
                onBefore: () => clearErrors(),
            } as any); // 'as any' silences the strict Inertia TS mismatch
        } else {
            put(`/admin/products/variants/${variant?.id}`, {
                ...payload,
                _method: 'PUT', // Now this is just a key in a plain object
                forceFormData: true,
                onBefore: () => clearErrors(),
            } as any);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-10">
            {hasErrors && (
                <PromptMessage type="error" errors={errors} className="my-3" />
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[240px_1fr] lg:grid-cols-[300px_1fr]">
                {/* images */}
                <div>
                    <p className="mb-1 text-[10px] tracking-widest uppercase">
                        Image
                    </p>
                    <div className="flex flex-col items-center">
                        <div className="mb-4 flex h-[200px] w-full items-center justify-center overflow-hidden rounded border border-gray-400 bg-gray-100 lg:aspect-2/1">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="block h-full w-full object-contain"
                                />
                            ) : (
                                <span className="px-4 text-center text-xs text-gray-400">
                                    No image selected
                                </span>
                            )}
                        </div>
                        <label className="w-full cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-center text-sm shadow-sm hover:bg-gray-50">
                            Upload Photo
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </label>
                        {errors.image && (
                            <p className="mt-2 text-xs text-red-500">
                                {errors.image}
                            </p>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    {/* name */}
                    <TextInput
                        label="Name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    {/* attributes */}
                    <div>
                        <p className="mb-1 text-[10px] tracking-widest uppercase">
                            Attributes (Size, Color, etc.)
                        </p>

                        {Object.entries(data.attributes).map(
                            ([key, value], idx) => (
                                <div
                                    key={idx}
                                    className="mb-1.5 flex items-center gap-2"
                                >
                                    <div className="flex-1">
                                        <select
                                            className="w-full rounded border border-gray-400 px-1 py-1 shadow-sm focus:ring-indigo-500"
                                            value={key}
                                            onChange={(e) =>
                                                handleAttributeKeyChange(
                                                    key,
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select Label...
                                            </option>
                                            {AVAILABLE_ATTRIBUTE_KEYS.map(
                                                (attr) => (
                                                    <option
                                                        key={attr}
                                                        value={attr}
                                                        // Disable if already picked in another row, unless it's the current row's key
                                                        disabled={
                                                            selectedKeys.includes(
                                                                attr,
                                                            ) && attr !== key
                                                        }
                                                    >
                                                        {attr}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <TextInput
                                            value={value}
                                            placeholder="value (e.g. Small)"
                                            onChange={(e) =>
                                                handleAttributeValueChange(
                                                    key,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <CustomButton
                                        type="button"
                                        label="✕"
                                        color="danger"
                                        onClick={() => removeAttribute(key)}
                                    />
                                </div>
                            ),
                        )}

                        <button
                            className="my-1 w-full cursor-pointer rounded border-2 border-dashed border-gray-300 p-2 font-bold text-gray-400"
                            onClick={addAttribute}
                            type="button"
                        >
                            Add Attribute
                        </button>
                    </div>
                    <div className="flex items-center gap-x-1.5">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) =>
                                setData('is_active', e.target.checked)
                            }
                            className="aspect-square w-4 rounded border border-gray-400 px-2 py-1 accent-sky-900 outline-none"
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

            <div className="flex items-center gap-x-2">
                <CustomButton
                    label="Cancel"
                    color="secondary"
                    onClick={() => window.history.back()}
                />
                <CustomButton
                    type="submit"
                    label={mode === 'create' ? 'Submit' : 'Update'}
                    loading={processing}
                    color="primary"
                />
            </div>
        </form>
    );
};

export default ProductVariantForm;
