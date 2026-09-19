import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { SideDrawer } from './SideDrawer';

const RaceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white opacity-95" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
);

interface HeaderProps {
    onOpenSavedRaces?: () => void;
    savedRacesCount?: number;
    isInSavedRaces?: boolean;
    onOpenAuthModal: (mode?: 'login' | 'signup') => void;
    onToast?: (msg: string, type?: 'success' | 'error') => void;
    onFetchCloudRunners?: () => void;
    isCloudLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
    onOpenSavedRaces, 
    savedRacesCount = 0,
    isInSavedRaces = false,
    onOpenAuthModal,
    onToast,
    onFetchCloudRunners,
    isCloudLoading = false
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser && !currentUser.isAnonymous) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const displayName = user?.displayName || user?.email?.split('@')[0] || '';
    const initial = (displayName.charAt(0) || 'U').toUpperCase();

    return (
        <>
            <header className="w-full max-w-5xl mx-auto bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-500 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-between gap-3 no-print transform transition-all">
                {/* Logo and App Title */}
                <div className="flex items-center space-x-3 space-x-reverse min-w-0">
                    <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-sm shadow-inner shrink-0">
                        <RaceIcon />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-2xl font-black tracking-tight drop-shadow-sm truncate">
                            مدبر سباق العدو الريفي
                        </h1>
                        <p className="text-[11px] text-indigo-100 font-medium hidden sm:block">
                            إدارة ومسح وحساب نتائج السباقات المدرسية
                        </p>
                    </div>
                </div>

                {/* Side Menu Drawer Button */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        className="flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 border border-white/25 hover:border-white/40 text-white font-black text-xs sm:text-sm transition-all shadow-sm active:scale-95 group"
                        title="فتح القائمة والخيارات"
                    >
                        {/* User Avatar badge or Menu Icon */}
                        {user ? (
                            <div className="flex items-center gap-2">
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Avatar"
                                        className="w-6 h-6 rounded-full border border-white/60 object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shadow-inner">
                                        {initial}
                                    </div>
                                )}
                                <span className="max-w-[90px] sm:max-w-[120px] truncate hidden xs:inline-block">
                                    {displayName}
                                </span>
                            </div>
                        ) : (
                            <span className="hidden xs:inline-block">القائمة</span>
                        )}

                        <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:rotate-12 transition-transform" />

                        {/* Notification badge for saved races */}
                        {savedRacesCount > 0 && (
                            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] sm:text-[11px] font-black leading-tight shadow-sm">
                                {savedRacesCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Side Drawer Component */}
            <SideDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onOpenSavedRaces={onOpenSavedRaces}
                savedRacesCount={savedRacesCount}
                isInSavedRaces={isInSavedRaces}
                onOpenAuthModal={onOpenAuthModal}
                onFetchCloudRunners={onFetchCloudRunners}
                isCloudLoading={isCloudLoading}
                onToast={onToast}
            />
        </>
    );
};
