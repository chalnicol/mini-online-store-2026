import type { CustomDeliveryTimeDetails } from '@/types/store';
import { getTodayDateString } from '@/utils/DateUtils';
import type React from 'react';
import { useState } from 'react';
import BaseModal from './BaseModal';
import CustomButton from './CustomButton';
import DateTimePicker from './DateTimePicker';
import PromptMessage from './PromptMessage';

interface CustomDeliveryFormModalProps {
  initialData: CustomDeliveryTimeDetails | null;
  onClose: () => void;
  onSubmit: (data: CustomDeliveryTimeDetails) => void;
}

const CustomDeliveryFormModal: React.FC<CustomDeliveryFormModalProps> = ({ initialData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CustomDeliveryTimeDetails>({
    date: initialData?.date || getTodayDateString(), // Default to today
    time: initialData?.time || '10:00:00', // Default to start of ops
  });
  const [formErrors, setFormErrors] = useState<Record<string, string> | null>(null);

  const today = getTodayDateString();

  // Calculate max date (10 days from now)
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 10);
  const maxDate = maxDateObj.toISOString().split('T')[0]; // Result: "2026-02-27"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    // 1. Calculate Boundary Dates
    const todayStr = getTodayDateString();

    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 10);
    const maxDateStr = maxDateObj.toISOString().split('T')[0];

    // 2. Tomorrow and Onwards Check
    // If date is today or earlier, show error
    if (formData.date <= todayStr) {
      setFormErrors({
        date: 'Deliveries must be scheduled at least one day in advance.',
      });
      return;
    }

    // 3. 10-Day Window Check
    if (formData.date > maxDateStr) {
      setFormErrors({
        date: `Deliveries can only be scheduled up to 10 days in advance (until ${maxDateStr}).`,
      });
      return;
    }

    // 4. Operating Hours Check
    const selectedTime = formData.time;
    if (selectedTime < '10:00:00' || selectedTime > '18:00:00') {
      setFormErrors({
        time: 'Please pick a time between 10:00 AM and 6:00 PM.',
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <BaseModal>
      <div className="flex justify-end">
        <button
          className="cursor-pointer rounded-t bg-sky-900 px-2 py-0.5 text-xs text-white hover:bg-sky-800"
          onClick={onClose}
        >
          CLOSE
        </button>
      </div>

      <div className="overflow-hidden rounded rounded-tr-none border border-gray-400 bg-white px-4 pt-2 pb-4 shadow-lg">
        <h2 className="px-1 text-lg font-bold">Set Custom Delivery Time</h2>
        <hr className="mt-1.5 mb-2 border-gray-300 shadow" />
        <div className="rounded-e border-s-4 border-sky-400 bg-sky-100 px-3 py-2 text-sm">
          <p>
            Deliveries must be within
            <span className="mx-1 font-bold">10 days</span> of today. Operating hours:{' '}
            <span className="font-bold">10:00 AM – 6:00 PM</span>.
          </p>
        </div>

        {formErrors && (
          <div className="mt-2 px-3">
            <PromptMessage type="error" errors={formErrors} />
          </div>
        )}

        <form className="mt-2 space-y-3" onSubmit={handleSubmit}>
          {/* DATE INPUT */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-slate-500">Delivery Date</label>
            <DateTimePicker
              value={formData.date}
              type="date"
              onChange={(val) => setFormData((prev) => ({ ...prev, date: val }))}
            />
          </div>

          {/* TIME INPUT (Same as before) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-slate-500">Preferred Time</label>
            <DateTimePicker
              value={formData.time}
              type="time"
              onChange={(val) => setFormData((prev) => ({ ...prev, time: val }))}
            />
          </div>

          {/* BUTTONS */}
          <div className="mt-4 flex gap-2">
            <CustomButton type="button" label="Cancel" color="secondary" onClick={onClose} />
            <CustomButton label="Confirm Schedule" color="primary" />
          </div>
        </form>
      </div>
    </BaseModal>
  );
};

export default CustomDeliveryFormModal;
