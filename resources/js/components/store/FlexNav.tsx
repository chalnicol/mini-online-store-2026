import { useOutsideClick } from '@/hooks/user-outside-click';
import type { NavItem } from '@/types/store';
import { Link, router, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface FlexNavProps {
    // children: React.ReactNode;
    className?: string;
    navItems: NavItem[];
}

const FlexNav = ({ className, navItems }: FlexNavProps) => {
    const { url } = usePage();

    const [showMenu, setShowMenu] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const parentMenuRef = useOutsideClick<HTMLDivElement>(() => {
        // 2. Callback function: close the dropdown when an outside click occurs
        setShowMenu(false);
    });

    const handleMenuClick = (href: string) => {
        setShowMenu(false);
        router.get(href);
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

    const isActive = (path: string) => url === path;

    const activeLabel =
        navItems.find((item) => isActive(item.href))?.label || '';

    return (
        <div className={className}>
            <div
                ref={parentMenuRef}
                className="block rounded bg-sky-900 md:hidden"
            >
                {/* <div className="flex items-center relative space-x-0.5"></div> */}
                <button
                    className="flex w-full cursor-pointer items-center gap-x-1 px-2 py-1 text-white hover:text-gray-300"
                    onClick={() => setShowMenu((prev) => !prev)}
                >
                    <Menu size={16} />
                    <span className="font-semibold">{activeLabel}</span>
                    {showMenu ? (
                        <ChevronUp size={16} className="ms-auto" />
                    ) : (
                        <ChevronDown size={16} className="ms-auto" />
                    )}
                </button>

                {showMenu && (
                    <div
                        ref={menuRef}
                        className="absolute z-10 mt-0.5 w-44 overflow-hidden rounded border border-gray-400 shadow-lg"
                    >
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                className={`w-full px-3 py-1.5 text-left text-sm font-semibold ${
                                    isActive(item.href)
                                        ? 'bg-sky-900 text-white'
                                        : 'cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                                onClick={() => handleMenuClick(item.href)}
                                disabled={isActive(item.href)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="hidden w-40 space-y-1.5 md:block">
                {navItems.map((item) =>
                    isActive(item.href) ? (
                        <p
                            key={'q' + item.id}
                            className="w-full rounded border border-gray-300 bg-sky-900 px-2.5 py-1.5 text-left text-sm font-bold text-white"
                        >
                            {item.label}
                        </p>
                    ) : (
                        <Link
                            key={'q' + item.id}
                            href={item.href}
                            className={`block w-full cursor-pointer rounded border border-gray-300 bg-gray-200 px-2.5 py-1.5 text-left text-sm font-bold text-gray-800 hover:bg-gray-100`}
                        >
                            {item.label}
                        </Link>
                    ),
                )}
            </div>
        </div>
    );
};

export default FlexNav;
