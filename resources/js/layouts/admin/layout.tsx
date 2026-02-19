import FlexNav from '@/components/store/FlexNav';
import { NavItem } from '@/types/store';
import CustomLayout from '../app-custom-layout';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    // const { url } = usePage();
    const navItems: NavItem[] = [
        { id: 1, href: '/admin', label: 'Dashboard' },
        { id: 2, href: '/admin/users', label: 'Users' },
        { id: 3, href: '/admin/products', label: 'Products' },
        { id: 4, href: '/admin/stocks', label: 'Stockers' },
        { id: 5, href: '/admin/orders', label: 'Orders' },
        { id: 6, href: '/admin/reviews', label: 'Reviews' },
    ];

    return (
        <CustomLayout>
            {/* <TitleBar title="Admin Panel" className="mb-3" /> */}
            <div className="flex flex-col gap-x-4 gap-y-2 md:flex-row">
                <FlexNav navItems={navItems} parentPath="/admin" />
                <div className="flex-1">{children}</div>
            </div>
        </CustomLayout>
    );
};

export default AdminLayout;
