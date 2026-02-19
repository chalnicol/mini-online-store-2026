import { useOutsideClick } from '@/hooks/user-outside-click';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types/store';
import { Link, router, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ChevronDown, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface FlexNavProps {
    // children: React.ReactNode;
    className?: string;
    navItems: NavItem[];
    parentPath?: string;
}

const FlexNav = ({ className, parentPath, navItems }: FlexNavProps) => {
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

    //
    const currentPath = url.split('?')[0];

    // 1. IMPROVED ACTIVE LOGIC
    const isActive = (path: string) => {
        const targetPath = path.split('?')[0];

        // If target is just root/admin, require an exact match
        // otherwise /admin matches everything
        if (targetPath === parentPath) {
            return currentPath === targetPath;
        }

        // For more specific routes like /admin/users, match prefix
        return (
            currentPath === targetPath ||
            currentPath.startsWith(`${targetPath}/`)
        );
    };

    // 2. FIND THE BEST LABEL
    // We sort by length descending to ensure '/admin/users' is checked before '/admin'
    const activeItem = [...navItems]
        .sort((a, b) => b.href.length - a.href.length)
        .find((item) => isActive(item.href));

    const activeLabel = activeItem?.label || 'Menu';

    return (
        <div className={className}>
            {/* Mobile View */}
            <div
                ref={parentMenuRef}
                className="relative block rounded bg-sky-900 md:hidden"
            >
                <button
                    className="flex w-full cursor-pointer items-center gap-x-1 px-2 py-1 text-white hover:text-gray-300"
                    onClick={() => setShowMenu((prev) => !prev)}
                >
                    <Menu size={18} />
                    <span className="text-lg font-semibold">{activeLabel}</span>

                    <ChevronDown
                        size={18}
                        className={cn(
                            'ms-auto transition-transform duration-300',
                            showMenu ? 'rotate-180' : '',
                        )}
                    />
                </button>

                {showMenu && (
                    <div
                        ref={menuRef}
                        className="absolute z-10 mt-0.5 w-44 overflow-hidden rounded border border-gray-400 shadow-lg"
                    >
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <button
                                    key={item.id}
                                    className={cn(
                                        'w-full px-3 py-1.5 text-left text-sm font-semibold transition-colors',
                                        active
                                            ? 'bg-sky-900 text-white'
                                            : 'cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200',
                                    )}
                                    disabled={active}
                                    onClick={() => handleMenuClick(item.href)}
                                    // Removed disabled={active} so users can click to "refresh" or go back to base list
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden w-40 space-y-1.5 md:block">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={'q' + item.id}
                            href={item.href}
                            disabled={active}
                            // Using Link for both states allows clicking active tab to "reset" to the base URL
                            className={cn(
                                'block w-full rounded border px-2.5 py-1.5 text-left text-sm font-bold shadow transition-all duration-300',
                                active
                                    ? 'pointer-events-none cursor-default border-sky-800 bg-sky-900 text-white'
                                    : 'cursor-pointer border-gray-300 bg-gray-200 text-gray-800 hover:bg-gray-100',
                            )}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default FlexNav;
