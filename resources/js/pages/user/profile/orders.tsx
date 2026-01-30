import OrderList from '@/components/store/profile/OrderList';
import CustomLayout from '@/layouts/app-custom-layout';
import ProfileLayout from '@/layouts/profile/layout';

const Orders = () => {
    return <OrderList />;
};

Orders.layout = (page: React.ReactNode) => (
    <CustomLayout>
        <ProfileLayout children={page} />
    </CustomLayout>
);

export default Orders;
