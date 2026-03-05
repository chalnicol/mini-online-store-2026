import { cn } from '@/lib/utils';
import { InventoryMovementStatus, ProductVariant } from '@/types/store';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import CustomButton from '../../CustomButton';
import PromptMessage from '../../PromptMessage';
import SelectSearchInput from '../../SelectSearchInput';
import TextInput from '../../TextInput';

const ADJUSTMENT_TYPES = ['Increment', 'Decrement'] as const;

type AdjustmentType = (typeof ADJUSTMENT_TYPES)[number];

interface AddPayload {
  product_variant_id: number;
  amount: number;
  status: InventoryMovementStatus;
  reason: string;
  adjustmentType: AdjustmentType;
}

const AdjustmentForm = () => {
  const { data, setData, post, processing, hasErrors, clearErrors, errors } = useForm<AddPayload>({
    product_variant_id: 0,
    amount: 0,
    status: 'available',
    reason: '',
    adjustmentType: 'Increment',
  });

  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [selectedReasonValue, setSelectedReasonValue] = useState<number | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    post(`/admin/inventories/storeAdjustment`, {
      onBefore: () => clearErrors(),
    });
  };

  const adjustmentReasons: string[] = [
    'Physical Inventory Count',
    'Damaged on Shell',
    'Theft or Loss',
    'Data Entry Correction',
    'Found Item in Warehouse',
  ];

  const handleReasonClick = (index: number) => {
    setSelectedReasonValue(index);
    setData('reason', `${adjustmentReasons[index]}`);
  };

  return (
    <form onSubmit={submit} className="space-y-4 py-1">
      {hasErrors && <PromptMessage type="error" errors={errors} className="mt-1 mb-3" />}

      {/* amount */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-[10px] tracking-wider uppercase">Adjustment Type</p>

          <div className="grid grid-cols-2 divide-x divide-gray-400 rounded border border-gray-400">
            {ADJUSTMENT_TYPES.map((type, i) => (
              <button
                key={i}
                type="button"
                className={cn(
                  'cursor-pointer bg-gray-200 px-2 py-1 text-gray-600 shadow-md first:rounded-l last:rounded-r disabled:cursor-default disabled:bg-sky-900 disabled:text-white disabled:shadow-none',
                )}
                disabled={processing || data.adjustmentType == type}
                onClick={() => setData('adjustmentType', type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <TextInput
          label="Amount"
          type="text"
          name="status"
          value={data.amount}
          onChange={(e) => setData('amount', parseInt(e.target.value))}
          required
        />
      </div>

      {/* select search */}
      <div className="space-y-1">
        <p className="text-[10px] tracking-wider uppercase">Product Variant</p>

        <SelectSearchInput<ProductVariant>
          value={variant ? [variant] : []}
          placeholder="Search Product Variants"
          onChange={(value) => {
            //..
            setVariant(value[0] || null);
            setData('product_variant_id', value[0]?.id || 0);
          }}
          itemsMaxCount={1}
          targetTable="variants"
          renderItem={(value) => (
            <div className="px-2 py-2">
              <p className="font-bold">{value.product?.name || 'Product Name'}</p>
              <p className="text-sm font-semibold text-slate-400">{value.name}</p>
            </div>
          )}
          renderSearchItem={(value) => (
            <div className="flex flex-col items-start gap-x-2 gap-y-0.5 sm:flex-row sm:items-baseline">
              <p className="font-bold">{value.product?.name}</p>
              <p className="rounded border border-gray-400 px-2 text-xs font-semibold text-slate-400">{value.name}</p>
            </div>
          )}
          addLink={'/admin/products/create'}
        />
      </div>

      <div className="space-y-1">
        <p className="text-[10px] tracking-wider uppercase">Reason</p>
        <div>
          <textarea
            name="reason"
            value={data.reason}
            onChange={(e) => setData('reason', e.target.value)}
            className="w-full rounded border border-gray-400 bg-white px-3 py-1 outline-none"
          ></textarea>
          <div className="flex flex-wrap gap-2">
            {adjustmentReasons.map((reason, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleReasonClick(i)}
                className="cursor-pointer rounded border border-gray-400 bg-gray-100 px-2 py-1 text-xs shadow hover:bg-gray-50 active:scale-95"
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CustomButton
        type="submit"
        label="Submit"
        color="primary"
        size="lg"
        loading={processing} //.
        disabled={processing}
      />
    </form>
  );
};
export default AdjustmentForm;
