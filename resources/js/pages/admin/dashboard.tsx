import TitleBar from '@/components/store/TitleBar';
import AdminLayout from '@/layouts/admin/layout';

const AdminDashboard = () => {
    return (
        <>
            <TitleBar title="Admin Dashboard" className="mb-3" />
            <p>This is the admin Dashboard</p>
        </>
    );
};

AdminDashboard.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default AdminDashboard;
