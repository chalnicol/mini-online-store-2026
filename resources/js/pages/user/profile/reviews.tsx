import CustomLayout from '@/layouts/app-custom-layout';
import ProfileLayout from '@/layouts/profile/layout';

const Reviews = () => {
    return <p>Reviews</p>;
};

Reviews.layout = (page: React.ReactNode) => (
    <CustomLayout>
        <ProfileLayout children={page} />
    </CustomLayout>
);

export default Reviews;
