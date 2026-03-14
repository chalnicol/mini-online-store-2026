import BaseModal from '@/components/store/BaseModal';
import CustomButton from '@/components/store/CustomButton';
import MenuOptions from '@/components/store/MenuOptions';
import Pagination from '@/components/store/Pagination';
import Rating from '@/components/store/Rating';
import StarPicker from '@/components/store/StarPicker';
import useDebounce from '@/hooks/use-debounce';
import ProfileLayout from '@/layouts/profile/layout';
import { cn, getImageUrl } from '@/lib/utils';
import { PaginatedResponse, Review } from '@/types/store';
import { Link, router } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PendingReview {
  order_id: number;
  order_number: string;
  order_item_id: number;
  product_id: number;
  product_variant_id: number;
  product_name: string;
  variant_name: string;
  image_path: string | null;
  product_slug: string | null;
}

interface ReviewsProps {
  myReviews: PaginatedResponse<Review>;
  pendingReviews: PaginatedResponse<PendingReview>;
  pendingTotal: number;
  reviewFilters: { search: string };
}

type TabType = 'my_reviews' | 'pending';

const Reviews = ({ myReviews, pendingReviews, pendingTotal, reviewFilters: filters }: ReviewsProps) => {
  const { data: reviews, meta } = myReviews;
  const { data: pendingItems, meta: pendingMeta } = pendingReviews;

  // console.log(pendingReviews);

  const tabs: { label: string; value: TabType }[] = [
    { label: 'My Reviews', value: 'my_reviews' },
    { label: `Pending (${pendingTotal})`, value: 'pending' },
  ];

  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') === 'pending' ? 'pending' : 'my_reviews';
  });

  const [search, setSearch] = useState(filters.search ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [toEdit, setToEdit] = useState<Review | null>(null);
  const [toWrite, setToWrite] = useState<PendingReview | null>(null);
  const [toDelete, setToDelete] = useState<Review | null>(null);

  const [formData, setFormData] = useState<{ rating: number; comment: string }>({
    rating: 5,
    comment: '',
  });

  const debouncedSearch = useDebounce(search, 400);

  // Search effect — only fires for my_reviews tab
  useEffect(() => {
    if (debouncedSearch === (filters.search ?? '')) return;
    const params: Record<string, string> = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch;
    if (currentTab === 'pending') params.tab = 'pending';
    router.get('/profile/reviews', params, { preserveState: true, preserveScroll: true });
  }, [debouncedSearch]);

  // Clamp my_reviews page if out of bounds
  useEffect(() => {
    if (!meta) return;
    if (meta.current_page > meta.last_page) {
      const params: Record<string, string | number> = { page: meta.last_page };
      if (debouncedSearch) params.search = debouncedSearch;
      router.get('/profile/reviews', params, { preserveState: true, preserveScroll: true });
    }
  }, [meta]);

  // useEffect(() => {
  //   console.log('component mounted');
  // }, []);

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    const params: Record<string, string> = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch;
    if (tab === 'pending') params.tab = 'pending';
    router.get('/profile/reviews', params, { preserveState: true, preserveScroll: true });
  };

  const handlePendingPageChange = (page: number) => {
    const params: Record<string, string | number> = { tab: 'pending', pending_page: page };
    if (debouncedSearch.trim()) params.search = debouncedSearch;
    router.get('/profile/reviews', params, { preserveState: true, preserveScroll: true });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!toEdit) return;
    setLoading(true);
    setError(null);
    router.put(`/profile/reviews/${toEdit.id}`, formData, {
      preserveScroll: true,
      preserveState: true,
      only: ['myReviews'],
      onError: (errors) => setError(errors.review ?? 'Failed to update review.'),
      onSuccess: () => setToEdit(null),
      onFinish: () => {
        resetForm();
        setLoading(false);
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    setLoading(true);
    setError(null);
    router.delete(`/profile/reviews/${toDelete.id}`, {
      preserveScroll: true,
      preserveState: true,
      only: ['myReviews', 'pendingReviews', 'pendingTotal'],
      onError: (errors) => setError(errors.review ?? 'Failed to delete review.'),
      onSuccess: () => setToDelete(null),
      onFinish: () => setLoading(false),
    });
  };

  const resetForm = () => setFormData({ rating: 5, comment: '' });

  const handleSubmitReview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!toWrite) return;
    setLoading(true);
    setError(null);
    router.post(
      '/profile/reviews',
      {
        product_id: toWrite.product_id,
        product_variant_id: toWrite.product_variant_id,
        order_item_id: toWrite.order_item_id,
        rating: formData.rating,
        comment: formData.comment,
      },
      {
        preserveScroll: true,
        preserveState: true,
        only: ['myReviews', 'pendingReviews', 'pendingTotal'],
        onError: (errors) => setError(errors.review ?? 'Failed to submit review.'),
        onSuccess: () => {
          setToWrite(null);
          handleTabChange('my_reviews');
        },
        onFinish: () => {
          resetForm();
          setLoading(false);
        },
      },
    );
  };

  const options: { label: string; value: string }[] = [
    { label: 'Edit', value: 'edit' },
    { label: 'Delete', value: 'delete' },
  ];

  const handleOptionClick = (value: string | number | null, review: Review) => {
    if (value === 'edit') {
      setFormData({ rating: review.rating, comment: review.comment ?? '' });
      setToEdit(review);
    } else if (value === 'delete') {
      setToDelete(review);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Tabs */}
        <div className="relative h-8.5 w-full overflow-x-auto overflow-y-hidden">
          <div className="absolute h-full w-full border-b border-gray-400"></div>
          <div className="absolute bottom-0 flex items-center gap-x-1 px-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className="min-w-26 cursor-pointer rounded-tl rounded-tr-lg border border-gray-400 px-3 py-1.5 text-sm transition-colors duration-300 hover:bg-gray-50 hover:font-semibold disabled:cursor-default disabled:border-b-transparent disabled:bg-gray-50 disabled:font-bold disabled:text-sky-900"
                disabled={tab.value === currentTab}
                onClick={() => handleTabChange(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="rounded border-s-4 border-rose-600 bg-red-50 p-2 text-xs text-rose-500">{error}</p>}

        {/* My Reviews Tab */}
        {currentTab === 'my_reviews' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-gray-400 px-3 py-1.5 focus:border-sky-500 focus:ring-1 focus:ring-sky-900 focus:outline-none"
            />

            {reviews.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex flex-col rounded border border-gray-300 shadow">
                      <div className="flex flex-grow items-start gap-3 p-2.5">
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <img
                              src={getImageUrl(review.variant.imagePath)}
                              alt={review.variant.name || 'variant Name'}
                              className="aspect-square w-9 flex-none rounded border border-gray-300 object-cover"
                            />
                            <div>
                              <p className="text-sm font-bold text-gray-700">{review.product?.name}</p>
                              <p className="text-xs text-gray-500">{review.variant?.name}</p>
                            </div>
                          </div>
                          <div className="mt-1.5 flex items-center gap-x-1">
                            <div className="relative flex aspect-square w-6 items-center justify-center">
                              <Star size={26} className="absolute fill-current text-yellow-400" />
                              <p className="absolute mt-0.5 text-xs font-bold">{review.rating}</p>
                            </div>
                            <p
                              className={cn(
                                'text-sm',
                                review.comment ? 'text-gray-700' : 'text-[10px] tracking-wider text-gray-400 uppercase',
                              )}
                            >
                              {review.comment ?? '[ no comment ]'}
                            </p>
                          </div>
                        </div>
                        <MenuOptions
                          pageOptions={options}
                          onOptionsClick={(value) => handleOptionClick(value, review)}
                        />
                      </div>
                      <div className="flex justify-between border-t border-gray-300 bg-gray-100 px-3 py-1 text-[10px] font-semibold tracking-widest text-gray-400">
                        <p>{review.isUpdated ? 'Edited' : 'Posted'}</p>
                        <p>{review.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination meta={meta} type="advanced" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Star size={64} className="mb-4 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-800">No reviews yet.</h2>
                <p className="text-gray-500">Reviews you write will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* Pending Tab */}
        {currentTab === 'pending' && (
          <div className="space-y-2">
            {pendingItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                  {pendingItems.map((pending) => (
                    <div
                      key={pending.order_item_id}
                      className="divide-y divide-gray-300 overflow-hidden rounded border border-gray-300 shadow"
                    >
                      <div className="flex items-start justify-between p-2.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={getImageUrl(pending.image_path)}
                            alt={pending.variant_name || 'variant Name'}
                            className="aspect-square w-9 flex-none rounded border border-gray-300 object-cover"
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-800">{pending.product_name}</p>
                            <p className="text-xs text-gray-500">{pending.variant_name}</p>
                          </div>
                        </div>
                        <CustomButton
                          label="Write Review"
                          color="secondary"
                          size="xs"
                          onClick={() => setToWrite(pending)}
                        />
                      </div>
                      <p className="bg-gray-50 px-3 py-0.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                        Order: {pending.order_number}
                      </p>
                    </div>
                  ))}
                </div>
                <Pagination meta={pendingMeta} type="advanced" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Star size={64} className="mb-4 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-800">No pending reviews.</h2>
                <p className="text-gray-500">All your delivered items have been reviewed.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {toEdit && (
        <BaseModal>
          <div className="flex justify-end">
            <button
              className="cursor-pointer rounded-t bg-sky-900 px-2 py-0.5 text-xs text-white hover:bg-sky-800"
              onClick={() => setToEdit(null)}
            >
              CLOSE
            </button>
          </div>
          <div className="space-y-3.5 rounded rounded-tr-none bg-white px-4 pt-3 pb-4 shadow-lg">
            <h2 className="border-b border-gray-300 pb-1 text-lg font-bold text-gray-500">Edit Review</h2>
            <div className="flex items-start gap-2">
              <img
                src={getImageUrl(toEdit.variant.imagePath)}
                alt={toEdit.variant.name || 'variant Name'}
                className="aspect-square w-9 flex-none rounded border border-gray-300 object-cover"
              />
              <div>
                <p className="text-sm font-bold text-gray-800">{toEdit.product?.name}</p>
                <p className="text-xs text-gray-500">{toEdit.variant?.name}</p>
              </div>
            </div>
            <form onSubmit={handleUpdate} className="space-y-2">
              <StarPicker
                value={formData.rating}
                disabled={loading}
                onChange={(value) => setFormData({ ...formData, rating: value })}
              />
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={3}
                placeholder="Update your comment..."
                className="w-full resize-none rounded border border-gray-400 px-2 py-1.5 outline-none focus:ring-1 focus:ring-sky-900"
              />
              <div className="flex items-center gap-2">
                <CustomButton
                  type="button"
                  label="Cancel"
                  color="secondary"
                  disabled={loading}
                  onClick={() => setToEdit(null)}
                />
                <CustomButton label="Update" color="primary" disabled={loading} loading={loading} />
              </div>
            </form>
          </div>
        </BaseModal>
      )}

      {/* Delete Modal */}
      {toDelete && (
        <BaseModal size="lg">
          <div className="rounded border border-gray-400 bg-white px-4 py-3">
            <p className="font-semibold text-slate-600">Are you sure you want to delete this review?</p>
            <div className="mt-2 rounded border border-gray-400 bg-gray-100 p-3">
              <div className="flex items-start gap-3">
                <img
                  src={getImageUrl(toDelete.variant.imagePath)}
                  alt={toDelete.variant.name || 'variant Name'}
                  className="aspect-square w-10 flex-none rounded border border-gray-400 object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-gray-800">{toDelete.product?.name}</p>
                  <p className="text-xs text-gray-500">{toDelete.variant?.name}</p>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <Rating rating={toDelete.rating} />
                {toDelete.comment && <p className="text-sm text-gray-600">{toDelete.comment}</p>}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <CustomButton label="Cancel" color="secondary" disabled={loading} onClick={() => setToDelete(null)} />
              <CustomButton
                label="Delete"
                color="danger"
                onClick={handleConfirmDelete}
                disabled={loading}
                loading={loading}
              />
            </div>
          </div>
        </BaseModal>
      )}

      {/* Write Review Modal */}
      {toWrite && (
        <BaseModal size="lg">
          <div className="flex justify-end">
            <button
              className="cursor-pointer rounded-t bg-sky-900 px-2 py-0.5 text-xs text-white hover:bg-sky-800"
              onClick={() => setToWrite(null)}
            >
              CLOSE
            </button>
          </div>
          <div className="space-y-3.5 rounded rounded-tr-none bg-white px-4 pt-3 pb-4 shadow-lg">
            <h2 className="border-b border-gray-300 pb-1 text-lg font-bold text-gray-500">Write A Review</h2>
            <Link href={`/products/${toWrite.product_slug}`} className="flex items-start gap-2">
              <img
                src={getImageUrl(toWrite.image_path)}
                alt={toWrite.variant_name || 'variant Name'}
                className="aspect-square w-9 flex-none rounded border border-gray-300 object-cover"
              />
              <div>
                <p className="text-sm font-bold text-gray-800">{toWrite.product_name}</p>
                <p className="text-xs text-gray-500">{toWrite.variant_name}</p>
              </div>
            </Link>
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <StarPicker
                value={formData.rating}
                disabled={loading}
                onChange={(value) => setFormData({ ...formData, rating: value })}
              />
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={3}
                placeholder="Share your experience..."
                className="w-full resize-none rounded border border-gray-400 px-2 py-1.5 outline-none focus:ring-1 focus:ring-sky-900"
              />
              <div className="flex items-center gap-2">
                <CustomButton
                  type="button"
                  label="Cancel"
                  color="secondary"
                  disabled={loading}
                  onClick={() => setToWrite(null)}
                />
                <CustomButton label="Submit" color="primary" disabled={loading} loading={loading} />
              </div>
            </form>
          </div>
        </BaseModal>
      )}
    </>
  );
};

Reviews.layout = (page: React.ReactNode) => <ProfileLayout>{page}</ProfileLayout>;

export default Reviews;
