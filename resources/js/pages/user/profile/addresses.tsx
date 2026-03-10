import AddressList from '@/components/store/profile/AddressList';
import ProfileLayout from '@/layouts/profile/layout';
import { AddressDetails, ServiceableArea } from '@/types/store';

interface AddressesProps {
    addresses: AddressDetails[];
    serviceableAreas: ServiceableArea[];
}

const Addresses = ({ addresses, serviceableAreas }: AddressesProps) => {
    return <AddressList addresses={addresses} serviceableAreas={serviceableAreas} />;
};

Addresses.layout = (page: React.ReactNode) => <ProfileLayout>{page}</ProfileLayout>;

export default Addresses;
