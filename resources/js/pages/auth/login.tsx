import gsap from 'gsap';
import React, { useEffect, useRef, useState } from 'react';

import LoginForm from '@/components/store/auth/LoginForm';
import RegisterForm from '@/components/store/auth/RegisterForm';
import CustomLayout from '@/layouts/app-custom-layout';
import { Head } from '@inertiajs/react';
// import { useAuth } from "@/context/AuthContext";

type LoginTab = 'login' | 'register';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

const Login = ({ status, canResetPassword, canRegister }: LoginProps) => {
    console.log(status, canResetPassword, canRegister);

    const [tab, setTab] = useState<LoginTab>('login');

    const registerContRef = useRef<HTMLDivElement>(null);
    const loginContRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // clearPrompts();

        if (registerContRef.current && loginContRef.current) {
            gsap.to([loginContRef.current, registerContRef.current], {
                xPercent: tab == 'register' ? -100 : 0,
                duration: 0.25,
                ease: 'power3.out',
                stagger: {
                    each: 0.1,
                    from: tab == 'register' ? 'start' : 'end',
                },
            });
        }
        return () => {
            gsap.killTweensOf([loginContRef.current, registerContRef.current]);
        };
    }, [tab]);

    return (
        <>
            <Head title={tab == 'login' ? 'Login' : 'Register'} />
            <div className="mx-auto max-w-md px-3">
                {/* tabs */}
                <div className="mt-3 mb-2 space-x-1 border-b border-gray-400">
                    <button
                        className={`min-w-20 rounded-t border border-b-0 px-2 py-1 font-semibold ${
                            tab == 'login'
                                ? 'border-sky-800 bg-sky-900 text-white'
                                : 'cursor-pointer border-gray-400 bg-white hover:bg-gray-100'
                        }`}
                        onClick={() => setTab('login')}
                        disabled={tab == 'login'}
                    >
                        Login
                    </button>
                    {canRegister && (
                        <button
                            className={`min-w-20 rounded-t border border-b-0 px-2 py-1 font-semibold ${
                                tab == 'register'
                                    ? 'border-sky-800 bg-sky-900 text-white'
                                    : 'cursor-pointer border-gray-400 bg-white hover:bg-gray-100'
                            }`}
                            onClick={() => setTab('register')}
                            disabled={tab == 'register'}
                        >
                            Register
                        </button>
                    )}
                </div>

                <div className="relative flex h-full overflow-x-hidden">
                    {/* login form */}
                    <div ref={loginContRef} className="w-full flex-none px-1">
                        <LoginForm
                            key={tab}
                            tab={tab}
                            canResetPassword={canResetPassword}
                        />
                    </div>
                    {/* register form */}
                    {canRegister && (
                        <div
                            ref={registerContRef}
                            className="w-full flex-none px-1"
                        >
                            <RegisterForm key={tab} tab={tab} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

Login.layout = (page: React.ReactNode) => <CustomLayout>{page}</CustomLayout>;

export default Login;
