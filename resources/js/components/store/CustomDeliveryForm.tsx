import type { CustomDeliveryTimeDetails } from '@/types/store';
import { getTodayDateString } from '@/utils/DateUtils';
import type React from 'react';
import { useState } from 'react';
import BaseModal from './BaseModal';
import CustomButton from './CustomButton';
import DateTimePicker from './DateTimePicker';

interface CustomDeliveryFormModalProps {
    initialData: CustomDeliveryTimeDetails | null;
    onClose: () => void;
    onSubmit: (data: CustomDeliveryTimeDetails) => void;
}

const CustomDeliveryFormModal: React.FC<CustomDeliveryFormModalProps> = ({
    initialData,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState<CustomDeliveryTimeDetails>({
        date: initialData?.date || getTodayDateString(), // Default to today
        time: initialData?.time || '10:00:00', // Default to start of ops
    });
    const [formErrors, setFormErrors] = useState<Record<string, string> | null>(
        null,
    );

    const today = getTodayDateString();

    // Calculate max date (10 days from now)
    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 10);
    const maxDate = maxDateObj.toISOString().split('T')[0]; // Result: "2026-02-27"

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors(null);

        // 1. Past Date Check
        if (formData.date < today) {
            setFormErrors({ date: 'Please select today or a future date.' });
            return;
        }

        // 2. 10-Day Window Check
        if (formData.date > maxDate) {
            setFormErrors({
                date: `Deliveries can only be scheduled up to 10 days in advance (until ${maxDate}).`,
            });
            return;
        }

        // 3. Operating Hours Check
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
        <BaseModal size="lg">
            <div className="overflow-visible rounded bg-white shadow-xl">
                <p className="rounded-t bg-sky-900 px-3 py-2 font-bold text-white">
                    Schedule Delivery
                </p>

                <div className="flex items-start gap-2 border-b border-sky-100 bg-sky-50 px-4 py-2 text-xs">
                    <ul className="list list-inside list-disc leading-relaxed text-sky-800">
                        <li>
                            Deliveries must be within
                            <span className="mx-1 underline">10 days</span> of
                            today.
                        </li>
                        <li>
                            Operating hours:{' '}
                            <span className="font-bold">
                                10:00 AM – 6:00 PM
                            </span>
                            .
                        </li>
                    </ul>
                </div>

                <form className="space-y-5 p-4" onSubmit={handleSubmit}>
                    {/* DATE INPUT */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold tracking-wide text-slate-500">
                            Delivery Date
                        </label>
                        <DateTimePicker
                            value={formData.date}
                            type="date"
                            onChange={(val) =>
                                setFormData((prev) => ({ ...prev, date: val }))
                            }
                        />
                        {formErrors?.date && (
                            <p className="mt-1 text-xs font-semibold text-rose-600">
                                {formErrors.date}
                            </p>
                        )}
                    </div>

                    {/* TIME INPUT (Same as before) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold tracking-wide text-slate-500">
                            Preferred Time
                        </label>
                        <DateTimePicker
                            value={formData.time}
                            type="time"
                            onChange={(val) =>
                                setFormData((prev) => ({ ...prev, time: val }))
                            }
                        />
                        {formErrors?.time && (
                            <p className="mt-1 text-xs font-semibold text-rose-600">
                                {formErrors.time}
                            </p>
                        )}
                    </div>

                    {/* BUTTONS */}
                    <div className="mt-6 flex gap-2">
                        <CustomButton
                            type="button"
                            label="Cancel"
                            color="secondary"
                            onClick={onClose}
                        />
                        <CustomButton
                            label="Confirm Schedule"
                            color="primary"
                        />
                    </div>
                </form>
            </div>
        </BaseModal>
    );
};

export default CustomDeliveryFormModal;
