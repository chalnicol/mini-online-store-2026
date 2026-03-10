import { InventoryMovement, ProductVariant, Supplier } from '@/types/store';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import CustomButton from '../../CustomButton';
import PromptMessage from '../../PromptMessage';
import SelectSearchInput from '../../SelectSearchInput';
import TextInput from '../../TextInput';

interface AddPayload {
  product_variant_id: number;
  quantity: number | string;
  unit_cost: number | string;
  update_price_instantly: boolean;
  supplier_id: number;
}

const PurchaseForm = ({ inventory }: { inventory?: InventoryMovement | null }) => {
  const { data, setData, post, processing, hasErrors, clearErrors, errors } = useForm<AddPayload>({
    product_variant_id: inventory ? inventory.productVariantId : 0,
    quantity: inventory?.quantity || 0,
    unit_cost: inventory?.unitCost || 0,
    update_price_instantly: true, // Default to true for convenience
    supplier_id: inventory?.supplierId || 0,
  });

  const [variant, setVariant] = useState<ProductVariant | null>(inventory?.variant || null);
  const [supplier, setSupplier] = useState<Supplier | null>(inventory?.supplier || null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // post(route('admin.inventory.purchase'));
    post(`/admin/inventories/purchase`, {
      onBefore: () => clearErrors(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 py-1">
      {hasErrors && <PromptMessage type="error" errors={errors} className="mt-1 mb-3" />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TextInput
          label="Quantity Received"
          type="text"
          name="reason"
          value={data.quantity}
          onChange={(e) => setData('quantity', e.target.value)}
          required
        />
        <TextInput
          label="Unit Cost (What you paid per item)"
          type="text"
          name="reason"
          value={data.unit_cost}
          onChange={(e) => setData('unit_cost', e.target.value)}
          required
        />
      </div>

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
          maxRows={2}
        />
      </div>

      <div className="space-y-1">
        <p className="text-[10px] tracking-wider uppercase">Supplier</p>
        <div>
          <SelectSearchInput<Supplier>
            value={supplier ? [supplier] : []}
            placeholder="Search Supplier"
            onChange={(value) => {
              //..
              setSupplier(value[0] || null);
              // console.log(value
              setData('supplier_id', value[0]?.id || 0);
            }}
            itemsMaxCount={1}
            targetTable="suppliers"
            renderItem={(value) => (
              <div className="px-2 py-2">
                <p className="text-sm font-bold sm:text-base">{value.name}</p>
                {value?.email ? (
                  <p className="text-xs font-semibold text-slate-400 sm:text-sm">{value.email}</p>
                ) : value?.contactNumber ? (
                  <p className="text-xs font-semibold text-slate-400 sm:text-sm">{value.contactNumber}</p>
                ) : (
                  <p>No contact information available.</p>
                )}
              </div>
            )}
            renderSearchItem={(value) => (
              <div className="flex flex-col gap-x-2 sm:flex-row sm:items-baseline">
                <p className="text-sm font-bold sm:text-base">{value.name}</p>
                {value?.email ? (
                  <p className="text-xs font-semibold text-slate-400 sm:text-sm">{value.email}</p>
                ) : value?.contactNumber ? (
                  <p className="text-xs font-semibold text-slate-400 sm:text-sm">{value.contactNumber}</p>
                ) : (
                  <p>No contact information available.</p>
                )}
              </div>
            )}
            addLink={'/admin/suppliers/create'}
            maxRows={2}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="update_price"
          checked={data.update_price_instantly}
          onChange={(e) => setData('update_price_instantly', e.target.checked)}
          className="aspect-square w-4 accent-sky-900"
        />
        <label htmlFor="update_price">Automatically update selling price to maintain 30% markup</label>
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
export default PurchaseForm;
