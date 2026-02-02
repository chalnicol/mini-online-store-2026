import FlexNav from '@/components/store/FlexNav';
import TitleBar from '@/components/store/TitleBar';
import { NavItem } from '@/types/store';

interface ProfileLayoutProps {
    children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
    // const { url } = usePage();
    const navItems: NavItem[] = [
        { id: 1, href: '/profile', label: 'Settings' },
        { id: 2, href: '/profile/addresses', label: 'Addresses' },
        { id: 3, href: '/profile/orders', label: 'Orders' },
        { id: 4, href: '/profile/reviews', label: 'Reviews' },
    ];

    return (
        <>
            <TitleBar title="Profile" className="mb-3" />
            <div className="flex flex-col gap-x-4 gap-y-2 md:flex-row">
                <FlexNav navItems={navItems} />
                <div className="flex-1">{children}</div>
            </div>
        </>
    );
};
export default ProfileLayout;
