import { inventoryMovementReasons } from '@/data';
import { cn } from '@/lib/utils';
import { InventoryMovementStatus, ProductVariant } from '@/types/store';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import CustomButton from '../../CustomButton';
import PromptMessage from '../../PromptMessage';
import SelectSearchInput from '../../SelectSearchInput';
import TextInput from '../../TextInput';

type AdjustmentType = 'increment' | 'decrement';

const AdjustmentForm = () => {
  const { data, setData, post, processing, hasErrors, clearErrors, errors } = useForm({
    product_variant_id: 0,
    amount: 0,
    status: 'available',
    reason: '',
    type: 'increment',
  });

  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [selectedReasonValue, setSelectedReasonValue] = useState<number | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    post(`/admin/inventories/adjustment`, {
      onBefore: () => clearErrors(),
    });
  };

  const handleReasonClick = (index: number) => {
    setSelectedReasonValue(index);
    setData('reason', inventoryMovementReasons[index]);
  };

  const types: { label: string; value: AdjustmentType }[] = [
    { label: 'Increment', value: 'increment' },
    { label: 'Decrement', value: 'decrement' },
  ];

  const status: { label: string; value: InventoryMovementStatus }[] = [
    { label: 'Available', value: 'available' },
    { label: 'Damaged', value: 'damaged' },
    { label: 'Quarantine', value: 'quarantine' },
    { label: 'Lost', value: 'lost' },
  ];

  return (
    <form onSubmit={submit} className="space-y-4 py-1">
      {hasErrors && <PromptMessage type="error" errors={errors} className="mt-1 mb-3" />}

      {/* amount */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-1">
          <p className="text-[10px] tracking-wider uppercase">Adjustment Type</p>

          <div className="grid grid-cols-2 divide-x divide-gray-400 rounded border border-gray-400">
            {types.map((type) => (
              <button
                key={type.value}
                type="button"
                className={cn(
                  'cursor-pointer bg-gray-200 px-2 py-1 text-gray-600 shadow-md first:rounded-l last:rounded-r disabled:cursor-default disabled:bg-sky-900 disabled:text-white disabled:shadow-none',
                )}
                disabled={processing || data.type == type.value}
                onClick={() => setData('type', type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <TextInput
          label="Amount"
          type="text"
          name="status"
          value={data.amount}
          onChange={(e) => setData('amount', Number(e.target.value) || 0)}
          required
        />
      </div>

      <div className="space-y-1">
        <p className="text-[10px] tracking-wider uppercase">Select Status</p>

        <div className="grid max-h-28 grid-cols-1 gap-2 overflow-y-auto rounded border border-gray-400 bg-white p-2 sm:grid-cols-2 lg:grid-cols-4">
          {status.map((status) => (
            <button
              key={status.value}
              value={status.value}
              className="cursor-pointer rounded border border-gray-400 bg-gray-100 px-2 py-1 text-left text-sm shadow-md transition-colors duration-300 hover:bg-gray-50 disabled:cursor-default disabled:bg-sky-900 disabled:font-semibold disabled:text-white disabled:shadow-none md:text-base"
              disabled={processing || data.status == status.value}
              onClick={() => setData('status', status.value)}
            >
              {status.label}
            </button>
          ))}
        </div>
        {/* <select
          name="status"
          value={data.status}
          onChange={(e) => setData('status', e.target.value)}
          className="w-full rounded border border-gray-400 bg-gray-200 px-2 py-1 text-gray-600 outline-none focus:ring-1 focus:ring-sky-900"
        >
          {status.map((status) => (
            <option
              key={status.value}
              value={status.value}
              className="bg-white hover:bg-sky-50 disabled:bg-gray-100 disabled:text-gray-800"
              disabled={processing || data.status == status.value}
            >
              {status.label}
            </option>
          ))}
        </select> */}
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
          maxRows={2}
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
            required
            rows={3}
          ></textarea>
          <div className="flex flex-wrap gap-2">
            {inventoryMovementReasons.map((reason, i) => (
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
