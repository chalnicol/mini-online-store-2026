import { useOutsideClick } from '@/hooks/user-outside-click';
import type { Tab } from '@/types/store';
import gsap from 'gsap';
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface FlexMenuProps<T> {
    // children: React.ReactNode;
    className?: string;
    activeTab: T;
    onClick: (tab: T) => void;
    tabs: Tab<T>[];
}

const FlexMenu = <T,>({
    className,
    activeTab,
    onClick,
    tabs,
}: FlexMenuProps<T>) => {
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const parentMenuRef = useOutsideClick<HTMLDivElement>(() => {
        // 2. Callback function: close the dropdown when an outside click occurs
        setShowMenu(false);
    });

    const getLabel = () => {
        const currentTab = tabs.find((tab) => tab.value === activeTab);
        if (currentTab) {
            return currentTab.label;
        }
        return '';
    };

    const handleMenuClick = (tab: T) => {
        onClick(tab);
        setShowMenu(false);
    };

    useEffect(() => {
        if (showMenu && menuRef.current) {
            gsap.fromTo(
                menuRef.current,
                { scale: 0 },
                {
                    scale: 1,
                    duration: 0.6,
                    ease: 'elastic.out(1, 0.5)',
                    transformOrigin: 'top left',
                },
            );
        }
        return () => {
            if (menuRef.current) {
                gsap.killTweensOf(menuRef.current);
            }
        };
    }, [showMenu]);

    return (
        <div
            ref={parentMenuRef}
            className={`inline-block rounded bg-sky-900 ${className}`}
        >
            {/* <div className="flex items-center relative space-x-0.5"></div> */}
            <button
                className="flex w-full cursor-pointer items-center gap-x-1 px-2 py-1 text-white hover:text-gray-300"
                onClick={() => setShowMenu((prev) => !prev)}
            >
                <Menu size={16} />
                <span className="font-bold">{getLabel()}</span>
                {showMenu ? (
                    <ChevronUp size={16} className="ms-auto" />
                ) : (
                    <ChevronDown size={16} className="ms-auto" />
                )}
            </button>

            {showMenu && (
                <div
                    ref={menuRef}
                    className="absolute z-10 mt-0.5 w-44 overflow-hidden rounded border border-gray-300 shadow"
                >
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            className={`w-full px-3 py-1.5 text-left text-sm font-semibold ${
                                t.value == activeTab
                                    ? 'bg-sky-900 text-white'
                                    : 'cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => handleMenuClick(t.value)}
                            disabled={t.value == activeTab}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FlexMenu;
