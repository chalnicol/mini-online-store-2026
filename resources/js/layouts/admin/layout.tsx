import FlexNav from '@/components/store/FlexNav';
import { adnminNavItems } from '@/data';
import CustomLayout from '../app-custom-layout';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    // const { url } = usePage();
    return (
        <CustomLayout>
            {/* <TitleBar title="Admin Panel" className="mb-3" /> */}
            <div className="flex flex-col gap-x-4 gap-y-2 md:flex-row">
                <FlexNav navItems={adnminNavItems} parentPath="/admin" />
                <div className="flex-1">{children}</div>
            </div>
        </CustomLayout>
    );
};

export default AdminLayout;
