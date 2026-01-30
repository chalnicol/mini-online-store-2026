import type { CustomDeliveryTimeDetails } from '@/types/store';
import { getTodayDateString } from '@/utils/DateUtils';
import gsap from 'gsap';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import BaseModal from './BaseModal';

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
        date: initialData?.date || '',
        time: initialData?.time || '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string> | null>(
        null,
    );
    const contRef = useRef<HTMLDivElement>(null);

    const today = getTodayDateString();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors(null);

        if (formData.date < today) {
            setFormErrors({
                date: 'Please select a date that is today or in the future.',
            });
            return;
        }

        const selectedTime = formData.time; // Format is "HH:mm"

        if (selectedTime < '10:00' || selectedTime > '18:00') {
            // alert("Please select a time between 10:00 AM and 6:00 PM.");
            setFormErrors({
                time: 'Please select a time between 10:00 AM and 6:00 PM.',
            });
            return;
        }

        onSubmit(formData);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormErrors(null);
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (contRef.current) {
            gsap.fromTo(
                contRef.current,
                { scale: 0 },
                {
                    scale: 1,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.5)',
                },
            );
        }
        return () => {
            gsap.killTweensOf(contRef.current);
        };
    }, []);

    return (
        <BaseModal>
            <div
                ref={contRef}
                className="w-full max-w-md overflow-hidden rounded bg-white shadow-md"
            >
                <p className="bg-sky-900 px-3 py-2 font-semibold text-white">
                    Custom Delivery Form
                </p>

                <div className="border-b border-sky-100 bg-sky-50 p-3">
                    <p className="text-sm leading-relaxed text-sky-800">
                        <strong>Note:</strong> Deliveries must be scheduled for
                        today or future dates. Operating hours are strictly{' '}
                        <strong>10:00 AM to 6:00 PM</strong>.
                    </p>
                </div>

                <form className="p-3" onSubmit={handleSubmit}>
                    <div>
                        <p className="mb-1 text-sm font-semibold">Set Date</p>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            min={today}
                            onChange={handleFormChange}
                            className="w-full rounded border px-2 py-1 focus:ring-1 focus:ring-sky-600 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mt-2">
                        <p className="mb-1 text-sm font-semibold">Set Time</p>
                        <input
                            type="time"
                            name="time"
                            min="10:00"
                            max="18:00"
                            value={formData.time}
                            onChange={handleFormChange}
                            className="w-full rounded border px-2 py-1 focus:ring-1 focus:ring-sky-600 focus:outline-none"
                            required
                        />
                        {formErrors && formErrors.time && (
                            <span className="mt-1 text-sm text-red-500">
                                {formErrors.time}
                            </span>
                        )}
                    </div>

                    <div className="mt-4 space-x-1">
                        <button
                            type="button"
                            className="cursor-pointer rounded border border-gray-400 bg-gray-200 px-3 py-0.5 font-semibold text-gray-600 hover:bg-gray-100"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="cursor-pointer rounded border bg-sky-900 px-3 py-0.5 font-semibold text-white hover:bg-sky-800"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </BaseModal>
    );
};
export default CustomDeliveryFormModal;
