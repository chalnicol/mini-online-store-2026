import { OrderDetails, OrderItem } from '@/types/store';
import { router } from '@inertiajs/react';
import { PackageX, Plus, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface ReturnItemForm {
    order_item_id: number;
    quantity: number;
    reason: string;
    photos: File[];
    previewUrls: string[];
}

interface ReturnRequestModalProps {
    order: OrderDetails;
    onClose: () => void;
}

const reasons: { value: string; label: string }[] = [
    { value: 'damaged_item_received', label: 'Damaged item received' },
    { value: 'expired_product',       label: 'Expired product' },
    { value: 'wrong_item_sent',       label: 'Wrong item sent' },
    { value: 'missing_items',         label: 'Missing items' },
];

const ReturnRequestModal = ({ order, onClose }: ReturnRequestModalProps) => {
    const [notes, setNotes]         = useState('');
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<ReturnItemForm[]>([]);
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    const availableItems = order.items?.filter(
        (item) => !selectedItems.find((s) => s.order_item_id === item.id),
    ) ?? [];

    const handleAddItem = (item: OrderItem) => {
        setSelectedItems((prev) => [
            ...prev,
            {
                order_item_id: item.id,
                quantity:      item.quantity,
                reason:        '',
                photos:        [],
                previewUrls:   [],
            },
        ]);
    };

    const handleRemoveItem = (orderItemId: number) => {
        setSelectedItems((prev) => prev.filter((i) => i.order_item_id !== orderItemId));
    };

    const handleItemChange = (orderItemId: number, field: keyof ReturnItemForm, value: unknown) => {
        setSelectedItems((prev) =>
            prev.map((i) => (i.order_item_id === orderItemId ? { ...i, [field]: value } : i)),
        );
    };

    const handlePhotos = (orderItemId: number, files: FileList | null) => {
        if (!files) return;

        const newFiles   = Array.from(files).slice(0, 3);
        const previews   = newFiles.map((f) => URL.createObjectURL(f));

        setSelectedItems((prev) =>
            prev.map((i) =>
                i.order_item_id === orderItemId
                    ? { ...i, photos: newFiles, previewUrls: previews }
                    : i,
            ),
        );
    };

    const handleRemovePhoto = (orderItemId: number, index: number) => {
        setSelectedItems((prev) =>
            prev.map((i) => {
                if (i.order_item_id !== orderItemId) return i;
                const photos      = i.photos.filter((_, idx) => idx !== index);
                const previewUrls = i.previewUrls.filter((_, idx) => idx !== index);
                return { ...i, photos, previewUrls };
            }),
        );
    };

    const handleSubmit = () => {
        if (selectedItems.length === 0) {
            setError('Please select at least one item to return.');
            return;
        }

        const missing = selectedItems.find((i) => !i.reason);
        if (missing) {
            setError('Please select a reason for each item.');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('notes', notes);

        selectedItems.forEach((item, index) => {
            formData.append(`items[${index}][order_item_id]`, String(item.order_item_id));
            formData.append(`items[${index}][quantity]`, String(item.quantity));
            formData.append(`items[${index}][reason]`, item.reason);
            item.photos.forEach((photo, photoIndex) => {
                formData.append(`items[${index}][photos][${photoIndex}]`, photo);
            });
        });

        router.post(`/profile/orders/${order.id}/return`, formData, {
            forceFormData: true,
            onError:  (errors) => setError(errors.return ?? 'Failed to submit return.'),
            onFinish: () => setLoading(false),
            onSuccess: () => onClose(),
        });
    };

    const getOrderItem = (orderItemId: number) =>
        order.items?.find((i) => i.id === orderItemId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <div>
                        <h2 className="font-bold text-gray-900">Request Return</h2>
                        <p className="text-xs text-gray-500">{order.orderNumber}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    {error && (
                        <p className="rounded border-s-4 border-rose-600 bg-red-50 p-2 text-xs text-rose-500">
                            {error}
                        </p>
                    )}

                    {/* Selected items */}
                    {selectedItems.length > 0 && (
                        <div className="space-y-3">
                            {selectedItems.map((selected) => {
                                const item = getOrderItem(selected.order_item_id);
                                if (!item) return null;
                                return (
                                    <div
                                        key={selected.order_item_id}
                                        className="overflow-hidden rounded border border-gray-200"
                                    >
                                        {/* Item header */}
                                        <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                {item.variant?.imagePath ? (
                                                    <img
                                                        src={item.variant.imagePath}
                                                        alt={item.variantName}
                                                        className="h-8 w-8 rounded border border-gray-200 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-gray-100">
                                                        <PackageX size={14} className="text-gray-300" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800">{item.productName}</p>
                                                    <p className="text-[10px] text-gray-500">{item.variantName}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(selected.order_item_id)}
                                                className="text-gray-400 hover:text-rose-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {/* Item fields */}
                                        <div className="space-y-2 p-3">
                                            <div className="flex items-center gap-3">
                                                <label className="w-20 text-xs font-semibold text-gray-600">
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={item.quantity}
                                                    value={selected.quantity}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            selected.order_item_id,
                                                            'quantity',
                                                            Math.min(Number(e.target.value), item.quantity),
                                                        )
                                                    }
                                                    className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none"
                                                />
                                                <span className="text-xs text-gray-400">
                                                    max {item.quantity}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="w-20 text-xs font-semibold text-gray-600">
                                                    Reason
                                                </label>
                                                <select
                                                    value={selected.reason}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            selected.order_item_id,
                                                            'reason',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none"
                                                >
                                                    <option value="">Select reason...</option>
                                                    {reasons.map((r) => (
                                                        <option key={r.value} value={r.value}>
                                                            {r.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Photos */}
                                            <div className="flex items-start gap-3">
                                                <label className="w-20 pt-1 text-xs font-semibold text-gray-600">
                                                    Photos
                                                </label>
                                                <div className="flex flex-1 flex-wrap gap-2">
                                                    {selected.previewUrls.map((url, idx) => (
                                                        <div key={idx} className="relative">
                                                            <img
                                                                src={url}
                                                                className="h-14 w-14 rounded border border-gray-200 object-cover"
                                                            />
                                                            <button
                                                                onClick={() =>
                                                                    handleRemovePhoto(selected.order_item_id, idx)
                                                                }
                                                                className="absolute -right-1 -top-1 rounded-full bg-rose-500 p-0.5 text-white"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {selected.previewUrls.length < 3 && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    fileInputRefs.current[selected.order_item_id]?.click()
                                                                }
                                                                className="flex h-14 w-14 items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 hover:border-sky-400 hover:text-sky-500"
                                                            >
                                                                <Upload size={16} />
                                                            </button>
                                                            <input
                                                                ref={(el) => {
                                                                    fileInputRefs.current[selected.order_item_id] = el;
                                                                }}
                                                                type="file"
                                                                accept="image/*"
                                                                multiple
                                                                className="hidden"
                                                                onChange={(e) =>
                                                                    handlePhotos(selected.order_item_id, e.target.files)
                                                                }
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Add item */}
                    {availableItems.length > 0 && (
                        <div className="overflow-hidden rounded border border-dashed border-gray-300">
                            <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    Add Items to Return
                                </p>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {availableItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-2 p-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            {item.variant?.imagePath ? (
                                                <img
                                                    src={item.variant.imagePath}
                                                    alt={item.variantName}
                                                    className="h-8 w-8 rounded border border-gray-200 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-gray-100">
                                                    <PackageX size={14} className="text-gray-300" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{item.productName}</p>
                                                <p className="text-[10px] text-gray-500">
                                                    {item.variantName} · Qty: {item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddItem(item)}
                                            className="flex items-center gap-1 rounded border border-sky-300 px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                                        >
                                            <Plus size={12} />
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">
                            Additional Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Describe the issue in more detail..."
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="rounded border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || selectedItems.length === 0}
                        className="rounded bg-sky-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Return'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReturnRequestModal;
