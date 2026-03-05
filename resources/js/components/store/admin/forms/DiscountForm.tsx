import { Discount, ProductVariant } from '@/types/store';
import { getTomorrowDate, sanitizeDateForInput } from '@/utils/DateUtils';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import CustomButton from '../../CustomButton';
import InlineDatePicker from '../../InlineDatePicker';
import PromptMessage from '../../PromptMessage';
import SelectSearchInput from '../../SelectSearchInput';
import TextInput from '../../TextInput';

const DiscountForm = ({ discount }: { discount?: Discount | null }) => {
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
    start_date: discount?.startDate ? sanitizeDateForInput(discount.startDate) : getTomorrowDate(),
    end_date: discount?.endDate ? sanitizeDateForInput(discount.endDate) : getTomorrowDate(),
    // Extract IDs from the variants array or default to empty
    variant_ids: discount?.variants ? discount.variants.map((v: any) => v.id) : [],
  });

  const [variants, setVariants] = useState<ProductVariant[]>(discount?.variants || []);

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

  return (
    <>
      <form onSubmit={handleSubmit}>
        {hasErrors && <PromptMessage type="error" errors={errors} className="my-3" />}

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            {/* type */}
            <div className="space-y-1.5">
              <p className="text-[10px] tracking-widest uppercase">Type</p>
              <div className="grid grid-cols-2 divide-x divide-gray-400 rounded border border-gray-400">
                <button
                  type="button"
                  className="cursor-pointer rounded-s bg-gray-200 py-1 font-semibold text-gray-600 shadow transition-colors duration-300 hover:bg-gray-100 disabled:pointer-events-none disabled:cursor-default disabled:bg-sky-900 disabled:text-white disabled:shadow-none"
                  disabled={data.type === 'fixed'}
                  onClick={() => setData('type', 'fixed')}
                >
                  Fixed
                </button>
                <button
                  type="button"
                  className="cursor-pointer rounded-e bg-gray-200 py-1 font-semibold text-gray-600 shadow transition-colors duration-300 hover:bg-gray-100 disabled:pointer-events-none disabled:cursor-default disabled:bg-sky-900 disabled:text-white disabled:shadow-none"
                  disabled={data.type === 'percentage'}
                  onClick={() => setData('type', 'percentage')}
                >
                  Percentage
                </button>
              </div>
            </div>

            <TextInput label="Code" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
            <TextInput label="Value" value={data.value} onChange={(e) => setData('value', e.target.value)} required />
            <TextInput
              label="Description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              required
            />
            {/* Start Date */}
            <div className="space-y-1.5">
              <p className="text-[10px] tracking-widest uppercase">Start Date</p>
              <InlineDatePicker
                value={data.start_date}
                onChange={(date) => setData('start_date', date)}
                // error={errors.start_date}
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <p className="text-[10px] tracking-widest uppercase">End Date</p>
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
              <p className="text-[10px] tracking-widest uppercase">Product Variants</p>

              <SelectSearchInput<ProductVariant>
                value={variants}
                placeholder="Search product variants"
                onChange={(value) => {
                  //..
                  setVariants(value);
                  setData(
                    'variant_ids',
                    value.map((v) => v.id),
                  );
                }}
                // itemsMaxCount={1}
                targetTable="variants"
                renderItem={(value) => (
                  <div className="px-2 py-1">
                    <p className="space-x-1 text-sm">
                      <span className="font-bold">{value.product?.name || 'Product Name'}</span>
                      <span className="font-semibold text-slate-400">({value.name})</span>
                    </p>
                  </div>
                )}
                renderSearchItem={(value) => (
                  <div>
                    <p className="space-x-1 text-sm">
                      <span className="font-bold">{value.product?.name || 'Product Name'}</span>
                      <span className="font-semibold text-slate-400">({value.name})</span>
                    </p>
                  </div>
                )}
                addLink={'/admin/products/create'}
                maxRows={2}
              />
            </div>

            <div className="flex items-center gap-x-1.5">
              <input
                type="checkbox"
                id="is_active"
                checked={data.is_active}
                onChange={(e) => setData('is_active', e.target.checked)}
                className="aspect-square w-4 rounded border border-gray-400 px-2 py-1 accent-sky-900 outline-none focus:ring-1 focus:ring-sky-900"
              />
              <label htmlFor="is_active" className="text-[10px] tracking-widest uppercase">
                Is Active
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-x-2">
          <CustomButton type="button" label="Cancel" color="secondary" disabled={processing} onClick={handleCancel} />
          <CustomButton
            type="submit"
            label={mode === 'create' ? 'Create' : 'Update'}
            color="primary"
            disabled={processing}
            loading={processing}
          />
        </div>
      </form>
    </>
  );
};

export default DiscountForm;
