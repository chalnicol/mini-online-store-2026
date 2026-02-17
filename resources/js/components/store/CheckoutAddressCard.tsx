import { cn } from '@/lib/utils';
import { AddressDetails } from '@/types/store';
import { House, Phone, User } from 'lucide-react';

interface CheckoutAddressCardProps {
    address: AddressDetails;
    className?: string;
}

const CheckoutAddressCard = ({
    address,
    className,
}: CheckoutAddressCardProps) => {
    return (
        <div className={cn('space-y-1', className)}>
            <div className="flex items-center gap-x-2 text-sm font-semibold text-gray-500">
                <House size={16} className="flex-none" />
                <p>{address.fullAddress}</p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 font-semibold">
                <p className="flex items-center gap-x-2 text-sm text-sky-900">
                    <User size={16} />
                    <span>{address.contactPerson}</span>
                </p>
                <p className="flex items-center gap-x-2 text-sm text-sky-900">
                    <Phone size={16} />
                    <span className="text-sm">{address.contactNumber}</span>
                </p>
                {address.isDefault == true && (
                    <p className="inline-block bg-gray-300 px-2 text-xs font-semibold text-gray-600 shadow">
                        Default
                    </p>
                )}
            </div>
        </div>
    );
};
export default CheckoutAddressCard;
