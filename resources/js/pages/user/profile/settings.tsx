import DeleteAccount from '@/components/store/profile/DeleteAccount';
import Details from '@/components/store/profile/Details';
import UpdatePassword from '@/components/store/profile/UpdatePassword';
import ProfileLayout from '@/layouts/profile/layout';
import { User } from '@/types/store';

interface SettingsProps {
    user: User;
}
const Settings = ({ user }: SettingsProps) => {
    return (
        <div className="w-full space-y-6 md:max-w-xl">
            <div className="space-y-3 rounded border border-gray-400 px-4 py-3 shadow-md">
                <p className="font-bold text-gray-600">Edit Details</p>
                <Details user={user} />
            </div>
            {/* <hr className="border-gray-400 shadow" /> */}
            <div className="space-y-3 rounded border border-gray-400 px-4 py-3 shadow-md">
                <p className="font-bold text-gray-600">Update Password</p>
                <UpdatePassword />
            </div>
            {/* <hr className="border-gray-400 shadow" /> */}

            <div className="rounded border border-gray-400 px-4 py-3 shadow-md">
                <DeleteAccount />
            </div>
        </div>
    );
};

Settings.layout = (page: React.ReactNode) => <ProfileLayout children={page} />;

export default Settings;
