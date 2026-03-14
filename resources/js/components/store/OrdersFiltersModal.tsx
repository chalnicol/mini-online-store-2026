import { getTodayDateString } from '@/utils/DateUtils';
import { useState } from 'react';
import BaseModal from './BaseModal';
import CustomButton from './CustomButton';
import DateTimePicker from './DateTimePicker';

interface Filters {
  search: string;
  status: string;
  date_from: string;
  date_to: string;
}

const OrdersFiltersModal = ({
  statusOptions,
  onClear,
  onApply,
  onClose,
  filters,
}: {
  filters: Filters | null;
  statusOptions: { label: string; value: string }[];
  onClose: () => void;
  onClear: () => void;
  onApply: (filters: Filters) => void;
}) => {
  const [filtersData, setFiltersData] = useState<Filters>({
    search: filters?.search ?? '',
    status: filters?.status ?? '',
    date_from: filters?.date_from ?? '',
    date_to: filters?.date_to ?? '',
  });

  const hasActiveFilters = filtersData.date_from !== '' || filtersData.date_to !== '' || filtersData.status !== '';

  const [datesEnabled, setDatesEnabled] = useState(filtersData.date_from !== '' || filtersData.date_to !== '');

  const toggleEnableDates = () => {
    if (!datesEnabled) {
      setFiltersData((prev) => ({
        ...prev,
        date_from: getTodayDateString(),
        date_to: getTodayDateString(),
      }));
    } else {
      setFiltersData((prev) => ({
        ...prev,
        date_from: '',
        date_to: '',
      }));
    }
    setDatesEnabled((prev) => !prev);
  };

  return (
    <BaseModal size="lg">
      <div className="flex justify-end">
        <button
          className="cursor-pointer rounded-t bg-sky-900 px-2 py-0.5 text-xs text-white hover:bg-sky-800"
          onClick={onClose}
        >
          CLOSE
        </button>
      </div>
      <div className="overflow-hidden rounded rounded-tr-none bg-white px-4 pt-3 pb-4 shadow-lg">
        <h2 className="border-b border-gray-400 pb-1 text-lg font-bold text-gray-500">Filters</h2>

        <div className="mt-4 space-y-1.5">
          <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Status</p>
          <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded border border-gray-400 bg-white p-1.5 md:grid-cols-3">
            {statusOptions.map((status, i) => (
              <button
                key={i}
                className="cursor-pointer rounded border border-gray-400 bg-gray-100 px-3 py-1.5 text-left text-sm transition-colors duration-300 hover:bg-gray-50 disabled:cursor-default disabled:bg-sky-900 disabled:font-bold disabled:text-white"
                disabled={filtersData.status == status.value}
                onClick={() => {
                  //..
                  setFiltersData((prev) => ({ ...prev, status: status.value }));
                }}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="mt-4 mb-2" />
        <div className="flex items-center gap-x-2 text-sm text-gray-500">
          <input
            id="dates"
            type="checkbox"
            className="h-4 w-4 text-white accent-sky-900"
            checked={datesEnabled}
            onChange={toggleEnableDates}
          />
          <label htmlFor="dates">Enable Date Filters</label>
        </div>

        <div className="mt-4 space-y-1.5">
          <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Date From</p>

          <DateTimePicker
            type="date"
            value={filtersData.date_from}
            onChange={(date) =>
              setFiltersData((prev) => ({
                ...prev,
                date_from: date,
                // If date_from is now after date_to, clamp date_to up
                date_to: prev.date_to && date > prev.date_to ? date : prev.date_to,
              }))
            }
            optionsPosition="top"
            disabled={!datesEnabled}
          />
        </div>

        <div className="mt-4 space-y-1.5">
          <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Date To</p>

          <DateTimePicker
            type="date"
            value={filtersData.date_to}
            onChange={(date) =>
              setFiltersData((prev) => ({
                ...prev,
                date_to: date,
                // If date_to is now before date_from, clamp date_from down
                date_from: prev.date_from && date < prev.date_from ? date : prev.date_from,
              }))
            }
            optionsPosition="top"
            disabled={!datesEnabled}
          />
        </div>

        <div className="mt-6 flex items-center gap-x-2">
          <CustomButton
            label="Clear Filters"
            color="secondary"
            disabled={!hasActiveFilters} //..
            onClick={onClear}
          />
          <CustomButton
            label="Apply Filters"
            color="primary"
            disabled={!hasActiveFilters}
            onClick={() => onApply(filtersData)}
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default OrdersFiltersModal;
