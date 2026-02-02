import { useCart } from '@/context/CartContext';
import { useFilterSearch } from '@/context/FilterSearchContext';
import { useOutsideClick } from '@/hooks/user-outside-click';
import { User as UserType } from '@/types/store';
import { Link, useForm, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ChevronDown, Menu, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import NavLink from './NavLink';

const Navbar: React.FC = () => {
    const { post } = useForm();
    const { resetAll } = useFilterSearch();
    const { cartItems } = useCart();
    const { url, props } = usePage();

    const user = ((props.auth as any)?.user as UserType) || null;

    const cartCount = user ? user.cartCount : cartItems.length;

    // console.log('auth user', user);

    const [showHiddenMenu, setShowHiddenMenu] = useState<boolean>(false);
    const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

    // const hiddenMenuRef = useRef<HTMLDivElement>(null);
    const hiddenMenuRef = useRef<(HTMLDivElement | null)[]>([]);

    const profileMenuRef = useRef<HTMLDivElement>(null);

    const { isCategoryListOpen, showCategoryList } = useFilterSearch();

    const parentProfileMenuRef = useOutsideClick<HTMLLIElement>(() => {
        // 2. Callback function: close the dropdown when an outside click occurs
        setShowProfileMenu(false);
    });

    // Update the function to take a "type" or the "setter"
    const closeMenuAnimation = (menuType?: 'profile' | 'hidden') => {
        // 1. Profile Menu Logic (Scale animation)
        if (
            (menuType === 'profile' || showProfileMenu) &&
            profileMenuRef.current
        ) {
            gsap.to(profileMenuRef.current, {
                scale: 0,
                duration: 0.6,
                ease: 'elastic.in(1, 0.5)',
                onComplete: () => setShowProfileMenu(false),
            });
        }

        // 2. Hidden Menu Logic (Timeline animation)
        if (
            (menuType === 'hidden' || showHiddenMenu) &&
            hiddenMenuRef.current[0]
        ) {
            const tl = gsap.timeline({
                onComplete: () => setShowHiddenMenu(false),
            });

            tl.to(hiddenMenuRef.current[0], {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
            }).to(
                hiddenMenuRef.current[1],
                {
                    xPercent: 100,
                    duration: 0.3,
                    ease: 'power2.in',
                },
                '<',
            );
        }
    };

    const toggleMenu = (
        currentValue: boolean,
        setterFunc: React.Dispatch<React.SetStateAction<boolean>>,
        type: 'profile' | 'hidden', // Add a type hint
    ) => {
        if (isCategoryListOpen) showCategoryList(false);

        if (!currentValue) {
            setterFunc(true);
        } else {
            closeMenuAnimation(type); // Tells the animation exactly which one to run
        }
    };

    // Usage:
    const handleProfileMenuClick = () =>
        toggleMenu(showProfileMenu, setShowProfileMenu, 'profile');
    const handleMenuClick = () =>
        toggleMenu(showHiddenMenu, setShowHiddenMenu, 'hidden');

    const handleLogout = async () => {
        setShowProfileMenu(false);
        if (showHiddenMenu) {
            closeMenuAnimation();
        }

        post('/logout', {
            onBefore: () => {
                console.log('logging out...');
            },
        });
    };

    useEffect(() => {
        const tl = gsap.timeline();

        if (showHiddenMenu && hiddenMenuRef.current) {
            // Clear any previous inline styles to prevent conflicts
            gsap.set(hiddenMenuRef.current[0], { clearProps: 'all' });
            gsap.set(hiddenMenuRef.current[1], { clearProps: 'all' });

            tl.from(hiddenMenuRef.current[0], {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.out',
            }).from(
                hiddenMenuRef.current[1],
                {
                    xPercent: 100,
                    duration: 0.4,
                    ease: 'power4.out',
                },
                '-=0.2',
            );
        }

        if (showProfileMenu && profileMenuRef.current) {
            gsap.fromTo(
                profileMenuRef.current,
                { scale: 0 },
                {
                    scale: 1,
                    duration: 0.5,
                    ease: 'elastic(1, 0.6)',
                    transformOrigin: 'top right',
                },
            );
        }

        const handleResize = () => {
            if (window.innerWidth > 768 && showHiddenMenu) {
                setShowHiddenMenu(false);
            }
            if (window.innerWidth <= 768 && showProfileMenu) {
                setShowProfileMenu(false);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            tl.kill();
            gsap.killTweensOf(hiddenMenuRef.current);
        };
    }, [
        showHiddenMenu,
        showProfileMenu,
        hiddenMenuRef.current,
        profileMenuRef.current,
    ]);

    const fullName = user ? `${user.fname} ${user.lname}` : 'Unknown User';
    const email = user ? user.email : '--';

    return (
        <nav className="flex h-14 border-b border-gray-300 bg-gray-100">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-x-6 px-4 text-gray-600">
                <div className="navbar-brand">
                    <Link
                        href="/"
                        onClick={(e) => {
                            e.preventDefault(); // Stop the default Inertia visit
                            resetAll(); // Use our custom reset logic
                        }}
                        className="rounded-lg border border-gray-400 bg-gray-100 px-3 text-lg font-bold shadow transition duration-300 hover:bg-gray-200"
                    >
                        Nicolas Online Store
                    </Link>
                </div>
                <div className="hidden flex-1 items-center md:flex">
                    {/* <ul>
                        <li>
                            <Link
                                href="/"
                                className="rounded-full border border-gray-400 px-3 py-2 text-sm font-semibold uppercase shadow transition duration-300 hover:border-gray-500"
                            >
                                Home
                            </Link>
                        </li>
                    </ul> */}

                    <ul className="ml-auto flex flex-none items-center space-x-3">
                        <li>
                            <NavLink
                                type="circle"
                                href="/cart"
                                only={['products', 'subtotal']}
                                preserveState
                                showIndicatorCount={cartCount > 0}
                                indicatorCount={cartCount}
                                icon="ShoppingCart"
                            />
                        </li>

                        {user ? (
                            <>
                                <li>
                                    {/* <Link
                                        href="/profile/notifications"
                                        only={['data']}
                                        preserveState
                                        className="flex aspect-square items-center justify-center gap-x-1 rounded-full border border-gray-400 px-2 shadow hover:border-gray-500 hover:bg-gray-50 active:scale-95"
                                    >
                                        <Bell size={18} />
                                    </Link>
                                    {user.unread_notifications_count > 0 && (
                                        <p className="absolute top-0 -right-2 rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                                            {user.unread_notifications_count}
                                        </p>
                                    )} */}
                                    <NavLink
                                        type="circle"
                                        href="/profile/notifications"
                                        only={['data']}
                                        preserveState
                                        showIndicatorCount={
                                            user.unreadNotificationsCount > 0
                                        }
                                        indicatorCount={
                                            user.unreadNotificationsCount
                                        }
                                        icon="Bell"
                                    />
                                </li>
                                <li
                                    className="relative"
                                    ref={parentProfileMenuRef}
                                >
                                    <button
                                        className="flex cursor-pointer items-center justify-center gap-x-1 rounded-full border border-gray-400 py-2 ps-4 pe-2 shadow hover:border-gray-500 hover:bg-gray-50 active:scale-95"
                                        onClick={handleProfileMenuClick}
                                    >
                                        <span className="text-sm font-semibold tracking-wider text-gray-600 uppercase">
                                            {user.fname}
                                        </span>
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {showProfileMenu && (
                                        <div
                                            ref={profileMenuRef}
                                            className="absolute top-full right-0 z-50 mt-2 w-52 overflow-hidden rounded border border-gray-400 bg-white p-1.5 shadow-lg"
                                        >
                                            <div className="rounded bg-sky-900 px-2 py-1.5 text-sm font-semibold text-white">
                                                <p>{fullName}</p>
                                                <p className="text-xs">
                                                    {email}
                                                </p>
                                            </div>
                                            <ul className="mt-1">
                                                <li>
                                                    <Link
                                                        href="/profile"
                                                        className="block w-full p-1 hover:bg-gray-100"
                                                        onClick={() =>
                                                            setShowProfileMenu(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        Profile
                                                    </Link>
                                                </li>
                                                <li>
                                                    <button
                                                        className="block w-full cursor-pointer border-t border-gray-300 p-1 text-left hover:bg-gray-100"
                                                        onClick={handleLogout}
                                                    >
                                                        Logout
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            </>
                        ) : (
                            <li>
                                <Link
                                    href="/login"
                                    className="flex cursor-pointer items-center justify-center gap-x-1 rounded-lg border border-gray-400 bg-gray-100 px-3 py-1 text-gray-600 shadow transition duration-300 hover:bg-gray-200"
                                >
                                    <User size={18} />
                                    <span className="font-semibold">
                                        Login/Register
                                    </span>
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>

                <div className="relative ml-auto md:hidden">
                    <button
                        className="cursor-pointer rounded border border-gray-400 px-2 py-1.5 shadow hover:bg-gray-200"
                        onClick={handleMenuClick}
                    >
                        {showHiddenMenu ? <X size={18} /> : <Menu size={18} />}
                    </button>
                    {((user && user.unreadNotificationsCount > 0) ||
                        cartCount > 0) &&
                        !showHiddenMenu && (
                            <p className="transiton absolute -top-1 -right-1.5 aspect-square w-3 rounded-full bg-rose-500 duration-300"></p>
                        )}
                </div>

                {showHiddenMenu && (
                    <div className="fixed bottom-0 left-0 z-20 h-[calc(100dvh-56px)] w-full text-white">
                        <div
                            ref={(el) => {
                                hiddenMenuRef.current[0] = el;
                            }}
                            className="absolute inset-0 bg-gray-500/50"
                            onClick={() => closeMenuAnimation()}
                        ></div>
                        <div
                            ref={(el) => {
                                hiddenMenuRef.current[1] = el;
                            }}
                            className="absolute top-0 right-0 h-full w-11/12 max-w-72 space-y-2 overflow-y-auto bg-white p-2 text-gray-600"
                        >
                            <NavLink
                                type="rect"
                                href="/cart"
                                only={['products', 'subtotal']}
                                preserveState
                                showIndicatorCount={cartCount > 0}
                                indicatorCount={cartCount}
                                onClick={() => closeMenuAnimation('hidden')}
                                icon="ShoppingCart"
                                label="Cart"
                            />

                            {user ? (
                                <>
                                    <NavLink
                                        type="rect"
                                        href="/profile/notifications"
                                        showIndicatorCount={
                                            user.unreadNotificationsCount > 0
                                        }
                                        indicatorCount={
                                            user.unreadNotificationsCount
                                        }
                                        onClick={() =>
                                            closeMenuAnimation('hidden')
                                        }
                                        icon="Bell"
                                        label="Notifications"
                                    />

                                    <div className="rounded bg-sky-900 px-2.5 py-1.5 text-sm font-semibold text-white">
                                        <p>{fullName}</p>
                                        <p className="text-xs">{email}</p>
                                    </div>
                                    <ul className="">
                                        <li>
                                            <Link
                                                href="/profile"
                                                className="block w-full border-t border-gray-300 px-3 py-2"
                                                onClick={() =>
                                                    closeMenuAnimation('hidden')
                                                }
                                            >
                                                Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <button
                                                className="block w-full border-y border-gray-300 px-3 py-2 text-left"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                </>
                            ) : (
                                <NavLink
                                    type="rect"
                                    href="/login"
                                    onClick={() => closeMenuAnimation('hidden')}
                                    icon="User"
                                    label="Login/Register"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
