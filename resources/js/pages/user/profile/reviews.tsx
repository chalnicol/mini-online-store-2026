import Pagination from '@/components/store/Pagination';
import Rating from '@/components/store/Rating';
import useDebounce from '@/hooks/use-debounce';
import ProfileLayout from '@/layouts/profile/layout';
import { cn } from '@/lib/utils';
import { PaginatedResponse, Review } from '@/types/store';
import { router } from '@inertiajs/react';
import { PackageX, Pencil, Star, Trash2 } from 'lucide-react';
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
  pendingReviews: PendingReview[];
  reviewFilters: { search: string };
}

type TabType = 'my_reviews' | 'pending';

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" onClick={() => onChange(star)}>
        <Star
          size={20}
          className={cn('transition-colors', star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')}
        />
      </button>
    ))}
  </div>
);

const Reviews = ({ myReviews, pendingReviews, reviewFilters: filters }: ReviewsProps) => {
  const { data: reviews, meta } = myReviews;

  const tabs: { label: string; value: TabType }[] = [
    { label: 'My Reviews', value: 'my_reviews' },
    { label: `Pending (${pendingReviews.length})`, value: 'pending' },
  ];

  const [currentTab, setCurrentTab] = useState<TabType>('my_reviews');
  const [search, setSearch] = useState(filters.search ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  // Write review state
  const [writingFor, setWritingFor] = useState<PendingReview | null>(null);
  const [writeRating, setWriteRating] = useState(0);
  const [writeComment, setWriteComment] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if (debouncedSearch === (filters.search ?? '')) return; // skip on mount

    router.get('/profile/reviews', { search }, { preserveState: true, preserveScroll: true });
  }, [debouncedSearch]);

  // const handleSearch = () => {
  //   router.get('/profile/reviews', { search }, { preserveState: true, preserveScroll: true });
  // };

  const handleStartEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment ?? '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleUpdate = (reviewId: number) => {
    setLoading(true);
    setError(null);
    router.put(
      `/profile/reviews/${reviewId}`,
      { rating: editRating, comment: editComment },
      {
        onError: (errors) => setError(errors.review ?? 'Failed to update review.'),
        onSuccess: () => handleCancelEdit(),
        onFinish: () => setLoading(false),
      },
    );
  };

  const handleDelete = (reviewId: number) => {
    if (!confirm('Delete this review?')) return;
    setLoading(true);
    router.delete(`/profile/reviews/${reviewId}`, {
      onError: (errors) => setError(errors.review ?? 'Failed to delete review.'),
      onFinish: () => setLoading(false),
    });
  };

  const handleSubmitReview = () => {
    if (!writingFor) return;
    if (writeRating === 0) {
      setError('Please select a rating.');
      return;
    }
    setLoading(true);
    setError(null);
    router.post(
      '/profile/reviews',
      {
        product_id: writingFor.product_id,
        product_variant_id: writingFor.product_variant_id,
        order_item_id: writingFor.order_item_id,
        rating: writeRating,
        comment: writeComment,
      },
      {
        onError: (errors) => setError(errors.review ?? 'Failed to submit review.'),
        onSuccess: () => {
          setWritingFor(null);
          setWriteRating(0);
          setWriteComment('');
          setCurrentTab('my_reviews');
        },
        onFinish: () => setLoading(false),
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}

      <div className="relative h-8.5 w-full overflow-x-auto overflow-y-hidden">
        <div className="absolute h-full w-full border-b border-gray-400"></div>
        <div className="absolute bottom-0 flex items-center gap-x-1 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className="cursor-pointer rounded-tl rounded-tr-lg border border-gray-400 bg-gray-200 px-3 py-1.5 text-sm transition-colors duration-300 hover:bg-gray-50 disabled:cursor-default disabled:border-b-transparent disabled:bg-gray-50 disabled:font-bold disabled:text-sky-900"
              disabled={tab.value === currentTab}
              onClick={() => setCurrentTab(tab.value)}
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
          {/* Search */}
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            // onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full rounded border border-gray-400 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-900 focus:outline-none"
          />

          {reviews.length > 0 ? (
            <>
              <div className="space-y-2">
                {reviews.map((review) => (
                  <div key={review.id} className="overflow-hidden rounded border border-gray-300">
                    <div className="flex gap-3 p-3">
                      {review.variant?.imagePath ? (
                        <img
                          src={review.variant.imagePath}
                          alt={review.variant.name ?? ''}
                          className="h-14 w-14 flex-none rounded border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 flex-none items-center justify-center rounded border border-gray-200 bg-gray-100">
                          <PackageX size={20} className="text-gray-300" />
                        </div>
                      )}

                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-800">{review.product?.name}</p>
                            <p className="text-xs text-gray-500">{review.variant?.name}</p>
                          </div>
                          {editingId !== review.id && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStartEdit(review)}
                                className="text-gray-400 hover:text-sky-600"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(review.id)}
                                disabled={loading}
                                className="text-gray-400 hover:text-rose-500 disabled:opacity-50"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {editingId === review.id ? (
                          <div className="space-y-2">
                            <StarPicker value={editRating} onChange={setEditRating} />
                            <textarea
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              rows={2}
                              placeholder="Update your comment..."
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdate(review.id)}
                                disabled={loading}
                                className="rounded bg-sky-900 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="rounded border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Rating rating={review.rating} size="sm" />
                            {review.comment && <p className="text-xs text-gray-600">{review.comment}</p>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between border-t border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-semibold tracking-widest text-gray-400">
                      <p>{review.isUpdated ? 'Edited' : 'Posted'}</p>
                      <p>{review.createdAt}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination meta={meta} type="simple" />
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
          {pendingReviews.length > 0 ? (
            pendingReviews.map((pending) => (
              <div key={pending.order_item_id} className="overflow-hidden rounded border border-gray-300">
                <div className="flex items-center gap-3 p-3">
                  {pending.image_path ? (
                    <img
                      src={pending.image_path}
                      alt={pending.variant_name}
                      className="h-14 w-14 flex-none rounded border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 flex-none items-center justify-center rounded border border-gray-200 bg-gray-100">
                      <PackageX size={20} className="text-gray-300" />
                    </div>
                  )}

                  <div className="flex flex-1 items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-gray-800">{pending.product_name}</p>
                      <p className="text-xs text-gray-500">{pending.variant_name}</p>
                      <p className="text-[10px] text-gray-400">Order: {pending.order_number}</p>
                    </div>
                    <button
                      onClick={() => {
                        setWritingFor(pending);
                        setWriteRating(0);
                        setWriteComment('');
                        setError(null);
                      }}
                      className="rounded border border-sky-300 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                    >
                      Write Review
                    </button>
                  </div>
                </div>

                {/* Inline review form */}
                {writingFor?.order_item_id === pending.order_item_id && (
                  <div className="space-y-2 border-t border-gray-200 bg-gray-50 p-3">
                    <StarPicker value={writeRating} onChange={setWriteRating} />
                    <textarea
                      value={writeComment}
                      onChange={(e) => setWriteComment(e.target.value)}
                      rows={2}
                      placeholder="Share your experience..."
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSubmitReview}
                        disabled={loading || writeRating === 0}
                        className="rounded bg-sky-900 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
                      >
                        {loading ? 'Submitting...' : 'Submit'}
                      </button>
                      <button
                        onClick={() => setWritingFor(null)}
                        className="rounded border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
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
  );
};

Reviews.layout = (page: React.ReactNode) => <ProfileLayout>{page}</ProfileLayout>;

export default Reviews;
