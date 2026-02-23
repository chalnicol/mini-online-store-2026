import TitleBar from '@/components/store/TitleBar';
import AdminLayout from '@/layouts/admin/layout';

const AdminDashboard = () => {
    return (
        <>
            <TitleBar title="Admin Dashboard" className="mb-3" />

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded border border-gray-400 p-2 shadow-md">
                    <h2 className="text-lg font-bold">Title</h2>
                    <p>This is a sample description.</p>
                </div>
                <div className="rounded border border-gray-400 p-2 shadow-md">
                    <h2 className="text-lg font-bold">Title</h2>
                    <p>This is a sample description.</p>
                </div>
                <div className="rounded border border-gray-400 p-2 shadow-md">
                    <h2 className="text-lg font-bold">Title</h2>
                    <p>This is a sample description.</p>
                </div>
                <div className="rounded border border-gray-400 p-2 shadow-md">
                    <h2 className="text-lg font-bold">Title</h2>
                    <p>This is a sample description.</p>
                </div>
                <div className="rounded border border-gray-400 p-2 shadow-md">
                    <h2 className="text-lg font-bold">Title</h2>
                    <p>This is a sample description.</p>
                </div>
                <div className="rounded border border-gray-400 p-2 shadow-md">
                    <h2 className="text-lg font-bold">Title</h2>
                    <p>This is a sample description.</p>
                </div>
            </div>
        </>
    );
};

AdminDashboard.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default AdminDashboard;
