import ConfirmationModal from '@/components/store/ConfirmationModal';
import CustomButton from '@/components/store/CustomButton';
import Notification from '@/components/store/Notification';
import TitleBar from '@/components/store/TitleBar';
import CustomLayout from '@/layouts/app-custom-layout';
import type {
    Notification as NotifType,
    PaginatedResponse,
} from '@/types/store';
import { router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

interface NotificationsProps {
    // Note: Ensuring the prop name 'data' matches your backend pagination object
    data: PaginatedResponse<NotifType>;
}

const Notifications = ({ data }: NotificationsProps) => {
    // const { data: localNotifications, links } = data;

    // console.log(data);

    const [localNotifications, setLocalNotifications] = useState<NotifType[]>(
        data.data,
    );

    const [nextPageUrl, setNextPageUrl] = useState<string | null>(
        data.links.next,
    );

    const { patch, post, delete: destroy, processing } = useForm();

    const [clicked, setClicked] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [toDelete, setToDelete] = useState<NotifType | null>(null);
    const [deleteAll, setDeleteAll] = useState<boolean>(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        // If user refreshes on ?page=3, send them back to the clean list
        if (params.has('page') && params.get('page') !== '1') {
            // router.replace('/profile/notifications');
            router.get(
                '/profile/notifications',
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                },
            );
        }
    }, []);

    useEffect(() => {
        if (data.meta.current_page === 1) {
            setLocalNotifications(data.data);
            setNextPageUrl(data.links.next);
        }
    }, [data]);

    const handleNotificationClick = (id: string) => {
        setClicked((prev) => (prev === id ? null : id));

        const target = localNotifications.find((n) => n.id === id);
        if (target && !target.isRead) {
            setLocalNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
            );

            patch(`/profile/notifications/${id}/read`, {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    // Optional: Roll back if the server fails
                    setLocalNotifications((prev) =>
                        prev.map((n) =>
                            n.id === id ? { ...n, isRead: false } : n,
                        ),
                    );
                },
            });
        }
    };

    const handleLoadMore = () => {
        if (!nextPageUrl || isLoadingMore) return;

        router.get(
            nextPageUrl,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['data'],
                onBefore: () => setIsLoadingMore(true),
                onSuccess: (page) => {
                    const incoming = page.props
                        .data as PaginatedResponse<NotifType>;
                    setLocalNotifications((prev) => [
                        ...prev,
                        ...incoming.data,
                    ]);
                    setNextPageUrl(incoming.links.next);
                },
                onFinish: () => setIsLoadingMore(false),
            },
        );
    };

    const handleRefreshList = () => {
        router.get(
            window.location.pathname,
            {},
            {
                only: ['data'],
                // preserveState: false, // Wipes local state
                preserveState: true, // Preserves local state
                preserveScroll: true,
                onBefore: () => setIsRefreshing(true),
                onFinish: () => setIsRefreshing(false),
            },
        );
    };

    const handleDelete = (id: string) => {
        const notifToDelete = localNotifications.find((n) => n.id === id);
        if (notifToDelete) setToDelete(notifToDelete);
    };

    const handleConfirmDelete = () => {
        if (!toDelete) return;
        destroy(`/profile/notifications/${toDelete.id}`, {
            onSuccess: () => {
                setLocalNotifications((prev) =>
                    prev.filter((n) => n.id !== toDelete?.id),
                );
                setToDelete(null);
                setClicked(null);
            },
            preserveScroll: true,
        });
    };

    const handleBatchMarkAllAsRead = () => {
        if (unreadNotifications.length === 0) return;
        post('/profile/notifications/mark-all-as-read', {
            preserveScroll: true,
            onSuccess: () => {
                setLocalNotifications((prev) =>
                    prev.map((n) => ({ ...n, isRead: true })),
                );
            },
        });
    };

    const handleDeleteAll = () => {
        if (localNotifications.length === 0) return;
        setDeleteAll(true);
        //..
    };
    const handleConfirmDeleteAll = () => {
        if (localNotifications.length === 0) return;
        destroy('/profile/notifications/destroy-all', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // 1. Wipe the local list completely
                setLocalNotifications([]);
                // 2. Hide the "Load More" button since there's nothing left
                setNextPageUrl(null);
                // 3. Close the modal
                setDeleteAll(false);
                //
                setClicked(null);
            },
        });
        //..
    };

    const unreadNotifications = useMemo(() => {
        return localNotifications.filter((n) => !n.isRead);
    }, [localNotifications]);

    return (
        <div className="mx-auto max-w-7xl p-4">
            <TitleBar title="Notifications" className="mb-3" animated={true} />

            <div className="flex items-center space-x-2">
                <CustomButton
                    size="sm"
                    color="secondary"
                    label={isRefreshing ? 'Refreshing...' : 'Refresh List'}
                    disabled={processing || isRefreshing || isLoadingMore}
                    onClick={handleRefreshList}
                />
                <CustomButton
                    size="sm"
                    color="secondary"
                    label="Mark All As Read"
                    disabled={
                        processing ||
                        isRefreshing ||
                        isLoadingMore ||
                        unreadNotifications.length === 0
                    }
                    onClick={handleBatchMarkAllAsRead}
                />
                <CustomButton
                    size="sm"
                    color="danger"
                    label="Delete All"
                    disabled={
                        processing ||
                        isRefreshing ||
                        isLoadingMore ||
                        localNotifications.length === 0
                    }
                    onClick={handleDeleteAll}
                />
            </div>

            {localNotifications.length > 0 ? (
                <div className="mt-3">
                    <div>
                        {localNotifications.map((notification) => (
                            <Notification
                                key={notification.id}
                                notification={notification}
                                isClicked={clicked === notification.id}
                                isProcessing={processing}
                                onClick={handleNotificationClick}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {/* LOAD MORE BUTTON */}
                    {nextPageUrl && (
                        <div className="mt-4 flex justify-center">
                            <CustomButton
                                size="sm"
                                color="secondary"
                                className="w-full md:w-auto"
                                label={
                                    isLoadingMore
                                        ? 'Loading...'
                                        : 'Load More Notifications'
                                }
                                onClick={handleLoadMore}
                                disabled={isLoadingMore || processing}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-3 flex min-h-44 flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 shadow">
                    <p className="text-lg font-bold text-gray-400 md:text-xl">
                        No notifications found.
                    </p>
                </div>
            )}

            {toDelete && (
                <ConfirmationModal
                    message="Are you sure you want to delete the notification?"
                    details={`ID: ${toDelete.id.toUpperCase()}`}
                    isProcessing={processing}
                    onClose={() => setToDelete(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}

            {deleteAll && (
                <ConfirmationModal
                    message="Are you sure you want to delete all notifications?"
                    isProcessing={processing}
                    onClose={() => setDeleteAll(false)}
                    onConfirm={handleConfirmDeleteAll}
                />
            )}

            {/* <Link
                href="/test-notification"
                className="mt-6 inline-block rounded border bg-sky-900 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-800"
            >
                Send Test Notification
            </Link> */}
        </div>
    );
};

export default Notifications;

Notifications.layout = (page: React.ReactNode) => (
    <CustomLayout>{page}</CustomLayout>
);
