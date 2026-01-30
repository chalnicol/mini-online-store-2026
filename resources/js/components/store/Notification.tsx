import { type Notification } from '@/types/store';
import { Link } from '@inertiajs/react';
import gsap from 'gsap';
import { Circle, Trash } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface NotificationProps {
    notification: Notification;
    isClicked: boolean;
    onClick: (id: string) => void;
    onDelete: (id: string) => void;
    isProcessing: boolean;
}

const Notification = ({
    notification,
    isClicked,
    isProcessing,
    onClick,
    onDelete,
}: NotificationProps) => {
    const messageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isClicked && messageRef.current) {
            // Animate from 0 to the specific scrollHeight of the content
            gsap.fromTo(
                messageRef.current,
                { height: 0, opacity: 0 },
                {
                    height: 'auto',
                    opacity: 1,
                    duration: 0.5,
                    ease: 'power2.out',
                    overwrite: true,
                },
            );
        }
    }, [isClicked]);

    return (
        <div className="flex items-start gap-x-3 border-t border-gray-300 px-3 py-2 transition-colors last:border-b even:bg-gray-100 hover:bg-sky-50">
            {/* 1. Changed button to div to allow nested Links/Interactions */}
            <div
                className="flex-1 cursor-pointer"
                onClick={() => onClick(notification.id)}
            >
                <div className="flex flex-col justify-between gap-x-1 gap-y-1.5 md:flex-row md:items-center">
                    <p
                        className={`flex items-center gap-x-1 text-sm ${notification.isRead ? 'font-semibold text-gray-600' : 'font-bold text-gray-800'}`}
                    >
                        {!notification.isRead && (
                            <Circle
                                size={10}
                                className="fill-current text-gray-800"
                            />
                        )}
                        <span>{notification.title}</span>
                    </p>
                    <p className="text-xs text-gray-500">{notification.date}</p>
                </div>

                {/* 2. Moved padding inside a wrapper so height: 0 works perfectly */}
                {isClicked && (
                    <div ref={messageRef} className="overflow-hidden">
                        <div className="my-2 space-y-2 rounded border border-gray-300 bg-white p-3 text-sm shadow-sm">
                            <p className="leading-relaxed text-gray-700">
                                {notification.message}
                            </p>
                            <Link
                                href={notification.url}
                                // 3. Stop propagation so clicking the link doesn't toggle the collapse
                                onClick={(e) => e.stopPropagation()}
                                className="inline-block rounded bg-sky-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-800"
                            >
                                Check it out
                            </Link>
                        </div>
                    </div>
                )}

                <span className="text-[10px] tracking-wider text-gray-500 uppercase">
                    ID: {notification.id}
                </span>
            </div>

            {/* Delete Button */}
            <button
                className={`flex aspect-square h-7 w-7 cursor-pointer items-center justify-center rounded-full shadow-sm transition-transform active:scale-95 ${
                    isProcessing
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-rose-500 text-white hover:bg-rose-600'
                }`}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent toggling the message when deleting
                    onDelete(notification.id);
                }}
                disabled={isProcessing}
            >
                <Trash size={14} />
            </button>
        </div>
    );
};

export default Notification;
