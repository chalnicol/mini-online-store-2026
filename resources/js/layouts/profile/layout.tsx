import FlexNav from '@/components/store/FlexNav';
import TitleBar from '@/components/store/TitleBar';
import { profileNavItems } from '@/data';
import CustomLayout from '../app-custom-layout';

interface ProfileLayoutProps {
    children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
    // const { url } = usePage();
    return (
        <CustomLayout showFilterSearch={true}>
            <TitleBar title="Profile" className="mb-3" />
            <div className="flex flex-col gap-x-4 gap-y-2 md:flex-row">
                <FlexNav navItems={profileNavItems} parentPath="/profile" />
                <div className="flex-1">{children}</div>
            </div>
        </CustomLayout>
    );
};
export default ProfileLayout;
