import type {
    CustomDeliveryTimeDetails,
    DeliveryType,
    DeliveryTypeDetails,
} from '@/types/store';
import { formatShortDate, formatTo12Hour } from '@/utils/DateUtils';
import gsap from 'gsap';
import { Circle, SquarePen } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface DeliveryTypeCardProps {
    t: DeliveryTypeDetails;
    deliveryType: DeliveryType;
    // className?: string;
    timeData: CustomDeliveryTimeDetails | null;
    onClick: (type: DeliveryType) => void;
    onEdit: (type: DeliveryType) => void;
}
const DeliveryTypeCard: React.FC<DeliveryTypeCardProps> = ({
    t,
    // className,
    timeData,
    deliveryType,
    onClick,
    onEdit,
}) => {
    const scheduleContRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (deliveryType === 'custom' && scheduleContRef.current) {
            gsap.fromTo(
                scheduleContRef.current,
                { height: 0 },
                { height: 'auto', duration: 0.6, ease: 'power4.out' },
            );
        }
        return () => {
            if (scheduleContRef.current) {
                gsap.killTweensOf(scheduleContRef.current);
            }
        };
    }, [deliveryType, scheduleContRef.current]);

    return (
        <div
            className={`group relative flex flex-1 flex-col rounded border border-gray-400 p-2 ${
                t.type == deliveryType
                    ? 'border-sky-900 bg-gray-50'
                    : 'bg-white hover:border-sky-900 hover:shadow-sm'
            }`}
            // onClick={() => onChange(t.type)}
            // disabled={t.type == deliveryType}
        >
            <button
                className={`relative flex flex-grow items-start ${
                    t.type == deliveryType ? '' : 'cursor-pointer'
                }`}
                onClick={() => onClick(t.type)}
            >
                <p className="absolute top-1 right-1">
                    {t.type == deliveryType ? (
                        <Circle
                            size={12}
                            className="fill-current text-sky-900"
                        />
                    ) : (
                        <Circle size={12} />
                    )}
                </p>
                <div className="relative flex w-full flex-col items-start">
                    <h4 className="font-bold text-gray-600">{t.name}</h4>

                    <p className="font-bold text-orange-800">
                        ₱<span className="text-lg">{t.price}</span>
                        .00
                    </p>
                    <p className="text-left text-sm">{t.description}</p>
                </div>
            </button>

            {t.type == 'custom' && (
                <div
                    ref={scheduleContRef}
                    className={`mt-1 flex w-full flex-none items-start space-y-1 overflow-hidden border-t border-gray-400 py-2 text-left text-sm ${
                        t.type == deliveryType ? '' : 'hidden'
                    }`}
                >
                    <div className="flex-1 space-y-1">
                        <div className="flex gap-x-1 font-semibold">
                            <p className="min-w-12 bg-gray-300 px-2 text-gray-600">
                                Date
                            </p>
                            <p className="text-gray-600">
                                {timeData
                                    ? formatShortDate(timeData.date)
                                    : '-'}
                            </p>
                        </div>
                        <div className="flex gap-x-1 font-semibold">
                            <p className="min-w-12 bg-gray-300 px-2 text-gray-600">
                                Time
                            </p>
                            <p className="text-gray-600">
                                {timeData ? formatTo12Hour(timeData.time) : '-'}
                            </p>
                        </div>
                    </div>

                    <button
                        className="ms-auto cursor-pointer rounded p-1 font-semibold text-sky-900 hover:text-sky-800"
                        onClick={() => onEdit(t.type)}
                    >
                        <SquarePen size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeliveryTypeCard;
