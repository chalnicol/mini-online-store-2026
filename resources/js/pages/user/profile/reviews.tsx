import ProfileLayout from '@/layouts/profile/layout';
import { Star } from 'lucide-react';

const Reviews = () => {
    return (
        <div className="flex flex-col items-center justify-center py-6 text-center">
            <Star size={64} className="mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800">
                No reviews found.
            </h2>
            <p className="mb-6 text-gray-500">
                You haven't submitted any reviews yet.
            </p>
            {/* <Link
                href="/"
                className="rounded-lg bg-sky-900 px-6 py-2 text-white hover:bg-sky-800"
            >
                Go Shopping
            </Link> */}
        </div>
    );
};

Reviews.layout = (page: React.ReactNode) => <ProfileLayout children={page} />;

export default Reviews;
