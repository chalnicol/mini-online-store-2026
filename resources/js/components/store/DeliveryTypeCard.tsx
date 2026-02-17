import type {
    CustomDeliveryTimeDetails,
    DeliveryType,
    DeliveryTypeDetails,
} from '@/types/store';
import { formatShortDate, formatTo12Hour } from '@/utils/DateUtils';
import gsap from 'gsap';
import { Circle } from 'lucide-react';
import { useEffect, useRef } from 'react';

// We extend the details to include the 'type' string for the logic below
interface DeliveryTypeCardProps {
    t: DeliveryTypeDetails & { type: DeliveryType };
    deliveryType: DeliveryType;
    timeData: CustomDeliveryTimeDetails | null;
    onClick: (type: DeliveryType) => void;
    onEdit: (type: DeliveryType) => void;
}

const DeliveryTypeCard: React.FC<DeliveryTypeCardProps> = ({
    t,
    timeData,
    deliveryType,
    onClick,
    onEdit,
}) => {
    const scheduleContRef = useRef<HTMLDivElement>(null);
    const isSelected = t.type === deliveryType;

    useEffect(() => {
        // Only animate if this specific card is the 'custom' one AND it's selected
        if (t.type === 'custom' && scheduleContRef.current) {
            if (isSelected) {
                gsap.fromTo(
                    scheduleContRef.current,
                    { height: 0, opacity: 0 },
                    {
                        height: 'auto',
                        opacity: 1,
                        duration: 0.4,
                        ease: 'power2.out',
                    },
                );
            } else {
                gsap.to(scheduleContRef.current, {
                    height: 0,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.in',
                });
            }
        }
    }, [isSelected, t.type]);

    return (
        <div
            className={`group relative flex flex-1 flex-col rounded border p-2 transition-all duration-200 ${
                isSelected
                    ? 'border-sky-900 bg-gray-50'
                    : 'border-gray-400 bg-white hover:border-sky-900 hover:shadow-sm'
            }`}
        >
            <button
                type="button"
                className={`relative flex flex-grow items-start text-left ${
                    isSelected ? 'cursor-default' : 'cursor-pointer'
                }`}
                onClick={() => onClick(t.type)}
            >
                <div className="absolute top-1 right-1">
                    <Circle
                        size={12}
                        className={`${isSelected ? 'fill-current text-sky-900' : 'text-gray-400'}`}
                    />
                </div>

                <div className="flex w-full flex-col items-start pr-6">
                    <h4 className="font-bold text-gray-600">{t.name}</h4>
                    <p className="font-bold text-orange-800">
                        ₱<span className="text-lg">{t.price}</span>.00
                    </p>
                    <p className="mt-1 text-sm leading-tight text-gray-500">
                        {t.description}
                    </p>
                </div>
            </button>

            {/* Custom Schedule Section */}
            {t.type === 'custom' && (
                <div
                    ref={scheduleContRef}
                    className="overflow-hidden" // Removed 'hidden' class to let GSAP handle height 0
                    style={{ height: isSelected ? 'auto' : 0 }}
                >
                    <div className="mt-2 flex w-full items-start border-t border-gray-300 pt-2 text-sm">
                        <div className="flex-1 space-y-1">
                            <div className="flex gap-x-1 font-semibold">
                                <span className="flex min-w-12 items-center bg-gray-200 px-2 text-xs text-gray-600 uppercase">
                                    Date
                                </span>
                                <span className="text-gray-700">
                                    {timeData
                                        ? formatShortDate(timeData.date)
                                        : '-'}
                                </span>
                            </div>
                            <div className="flex gap-x-1 font-semibold">
                                <span className="flex min-w-12 items-center bg-gray-200 px-2 text-xs text-gray-600 uppercase">
                                    Time
                                </span>
                                <span className="text-gray-700">
                                    {timeData
                                        ? formatTo12Hour(timeData.time)
                                        : '-'}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="ms-auto cursor-pointer rounded border border-sky-900 px-1.5 text-xs text-sky-900 transition-colors hover:text-gray-400"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggerring the card's onClick
                                onEdit(t.type);
                            }}
                        >
                            {/* <SquarePen size={18} /> */}
                            edit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryTypeCard;
