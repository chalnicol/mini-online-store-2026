import AddressList from '@/components/store/profile/AddressList';
import ProfileLayout from '@/layouts/profile/layout';
import { AddressDetails } from '@/types/store';

interface AddressesProps {
    addresses: AddressDetails[];
}

const Addresses = ({ addresses }: AddressesProps) => {
    return <AddressList addresses={addresses} />;
};

Addresses.layout = (page: React.ReactNode) => <ProfileLayout children={page} />;

export default Addresses;
