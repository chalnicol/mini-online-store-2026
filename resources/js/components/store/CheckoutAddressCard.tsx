import { AddressDetails } from '@/types/store';
import { Building, Home, MapPin } from 'lucide-react';

interface AddressCardProps {
    address: AddressDetails;
    className?: string;
}

const AddressCard = ({ address, className }: AddressCardProps) => {
    return (
        <div className={className}>
            <div className="flex items-center gap-x-2 text-sm font-bold">
                {address.type == 'Home' && (
                    <Home size={28} className="flex-none" />
                )}
                {address.type == 'Office' && (
                    <Building size={26} className="flex-none" />
                )}
                {address.type == 'Other' && (
                    <MapPin size={26} className="flex-none" />
                )}

                <div className="space-y-1">
                    <p className="text-gray-600">
                        {address.isDefault == true && (
                            <span className="me-2 rounded bg-sky-900 px-2 text-xs font-semibold text-white">
                                Default
                            </span>
                        )}
                        {address.fullAddress}
                    </p>
                    <p className="space-x-2 text-gray-400">
                        <span>{address.contactPerson}</span>
                        <span>|</span>
                        <span>{address.contactNumber}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default AddressCard;
