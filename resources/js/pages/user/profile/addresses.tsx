import AddressList from '@/components/store/profile/AddressList';
import CustomLayout from '@/layouts/app-custom-layout';
import ProfileLayout from '@/layouts/profile/layout';
import { AddressDetails } from '@/types/store';

interface AddressesProps {
    addresses: AddressDetails[];
}

const Addresses = ({ addresses }: AddressesProps) => {
    return <AddressList addresses={addresses} />;
};

Addresses.layout = (page: React.ReactNode) => (
    <CustomLayout>
        <ProfileLayout children={page} />
    </CustomLayout>
);

export default Addresses;
