import OrderList from '@/components/store/profile/OrderList';
import ProfileLayout from '@/layouts/profile/layout';

const Orders = () => {
    return <OrderList />;
};

Orders.layout = (page: React.ReactNode) => <ProfileLayout children={page} />;

export default Orders;
