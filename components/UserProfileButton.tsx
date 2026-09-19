import React, { useState, useEffect, useRef } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
    LogIn,
    LogOut,
    Mail,
    ShieldCheck,
    ChevronDown,
    UserPlus
} from 'lucide-react';
import { auth, logOut } from '../services/firebase';

interface UserProfileButtonProps {
    onOpenAuthModal: (mode?: 'login' | 'signup') => void;
    onToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const UserProfileButton: React.FC<UserProfileButtonProps> = ({
    onOpenAuthModal,
    onToast
}) => {
    const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // Check if authenticated with email/google or real account (not anonymous unless named)
            if (currentUser && !currentUser.isAnonymous) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logOut();
            setIsOpen(false);
            if (onToast) onToast('تم تسجيل الخروج بنجاح', 'success');
        } catch (err: any) {
            if (onToast) onToast('تعذر تسجيل الخروج: ' + err.message, 'error');
        }
    };

    if (!user) {
        return (
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onOpenAuthModal('login')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-white/20 hover:bg-white/30 text-white border border-white/20 hover:border-white/40 transition-all shadow-sm active:scale-95"
                    title="تسجيل الدخول إلى حسابك"
                >
                    <LogIn className="w-3.5 h-3.5 text-amber-300" />
                    <span>دخول</span>
                </button>
                <button
                    type="button"
                    onClick={() => onOpenAuthModal('signup')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all shadow-sm active:scale-95"
                    title="فتح حساب جديد بالبريد الإلكتروني"
                >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>فتح حساب</span>
                </button>
            </div>
        );
    }

    const displayName = user.displayName || user.email?.split('@')[0] || 'المستخدم';
    const email = user.email || '';
    const initial = (displayName.charAt(0) || 'U').toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-sm"
                title="الملف الشخصي والحساب"
            >
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full border border-white/40 object-cover"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shadow-inner">
                        {initial}
                    </div>
                )}
                <span className="max-w-[100px] truncate text-xs font-black hidden sm:inline-block">
                    {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/80" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-toast-in text-slate-800 dark:text-slate-100">
                    {/* User Info Header */}
                    <div className="flex items-center gap-3 p-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full border border-indigo-500/30 object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                                {initial}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {displayName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate dir-ltr text-right">{email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status badge */}
                    <div className="px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl mb-3 flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>حساب موثق وسحابي</span>
                        </span>
                        <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-800/60 px-1.5 py-0.5 rounded-md font-mono">
                            {user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'}
                        </span>
                    </div>

                    {/* Actions */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 font-black text-xs transition flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/40"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            )}
        </div>
    );
};
