
import React from 'react';
import { FIREBASE_PROJECT_ID } from '../services/firebase';
import { PWAInstallButton } from './PWAInstallButton';
import { UserProfileButton } from './UserProfileButton';

const RaceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-90" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
);

interface HeaderProps {
    onOpenSavedRaces?: () => void;
    savedRacesCount?: number;
    isInSavedRaces?: boolean;
    onOpenAuthModal: (mode?: 'login' | 'signup') => void;
    onToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    onOpenSavedRaces, 
    savedRacesCount = 0,
    isInSavedRaces = false,
    onOpenAuthModal,
    onToast
}) => {
    return (
        <header className="w-full max-w-5xl mx-auto bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-500 text-white p-4 sm:p-5 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none flex flex-col sm:flex-row items-center justify-between gap-4 no-print transform transition-all">
            <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm shadow-inner">
                    <RaceIcon />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm">
                        مدبر سباق العدو الريفي المدرسي
                    </h1>
                    <p className="text-[11px] text-indigo-100 font-medium hidden sm:block">
                        إدارة ومسح وحساب نتائج السباقات المدرسية
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
                {/* User Profile / Auth Button */}
                <UserProfileButton onOpenAuthModal={onOpenAuthModal} onToast={onToast} />

                {/* PWA Install Button */}
                <PWAInstallButton />

                {onOpenSavedRaces && (
                    <button
                        onClick={onOpenSavedRaces}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all shadow-sm active:scale-95 ${
                            isInSavedRaces
                                ? 'bg-amber-400 text-slate-900 shadow-amber-300/40 ring-2 ring-white/70'
                                : 'bg-white/20 hover:bg-white/30 text-white border border-white/20 hover:border-white/40'
                        }`}
                        title="عرض قائمة السباقات المنجزة المحفوظة والنتائج"
                    >
                        <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span>السباقات المنجزة</span>
                        {savedRacesCount > 0 && (
                            <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full text-[11px] font-black leading-tight shadow-sm">
                                {savedRacesCount}
                            </span>
                        )}
                    </button>
                )}

                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-xs font-semibold shadow-inner">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                    </span>
                    <span className="text-white/95 dir-ltr font-mono">{FIREBASE_PROJECT_ID}</span>
                    <span className="text-amber-300 font-bold">Firebase</span>
                </div>
            </div>
        </header>
    );
};



