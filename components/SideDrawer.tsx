import React, { useEffect, useState } from 'react';
import {
    X,
    Trophy,
    Smartphone,
    CloudDownload,
    LogIn,
    LogOut,
    UserPlus,
    User as UserIcon,
    ShieldCheck,
    FolderKanban,
    FileSpreadsheet,
    QrCode
} from 'lucide-react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, logOut, FIREBASE_PROJECT_ID } from '../services/firebase';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSavedRaces?: () => void;
    savedRacesCount?: number;
    isInSavedRaces?: boolean;
    onOpenAuthModal: (mode?: 'login' | 'signup') => void;
    onFetchCloudRunners?: () => void;
    isCloudLoading?: boolean;
    onToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
    isOpen,
    onClose,
    onOpenSavedRaces,
    savedRacesCount = 0,
    isInSavedRaces = false,
    onOpenAuthModal,
    onFetchCloudRunners,
    isCloudLoading = false,
    onToast
}) => {
    const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
    const { isInstallable, isInstalled, install } = usePWAInstall();

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

    // Close drawer on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleLogout = async () => {
        try {
            await logOut();
            onClose();
            if (onToast) onToast('تم تسجيل الخروج بنجاح', 'success');
        } catch (err: any) {
            if (onToast) onToast('تعذر تسجيل الخروج: ' + err.message, 'error');
        }
    };

    const handleInstallClick = async () => {
        if (isInstallable) {
            await install();
        } else {
            if (onToast) onToast('يمكنك تثبيت التطبيق عبر خيارات المتصفح (إضافة إلى الشاشة الرئيسية)', 'success');
        }
    };

    if (!isOpen) return null;

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'المستخدم';
    const email = user?.email || '';
    const initial = (displayName.charAt(0) || 'U').toUpperCase();

    return (
        <div className="fixed inset-0 z-50 overflow-hidden no-print animate-fade-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10" dir="rtl">
                <div className="w-screen max-w-sm sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-l from-indigo-700 via-indigo-600 to-blue-600 p-5 text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-inner">
                                <Trophy className="w-5 h-5 text-amber-300" />
                            </div>
                            <div>
                                <h3 className="font-black text-base text-white">القائمة الجانبية</h3>
                                <p className="text-[11px] text-indigo-100 font-medium">الخيارات والتحكم السحابي</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="إغلاق القائمة"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        
                        {/* 1. USER PROFILE SECTION */}
                        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
                            <div className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                                <span>الحساب والمستخدم</span>
                            </div>

                            {user ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        {user.photoURL ? (
                                            <img
                                                src={user.photoURL}
                                                alt="Avatar"
                                                className="w-12 h-12 rounded-2xl border-2 border-indigo-500/30 object-cover shadow-sm"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-black text-base flex items-center justify-center shadow-md">
                                                {initial}
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                                                {displayName}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate dir-ltr text-right">
                                                {email}
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                <span>حساب موثق سحابياً</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/40"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>تسجيل الخروج من الحساب</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                        سجل الدخول لحفظ ومزامنة النتائج والسباقات سحابياً.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                onOpenAuthModal('login');
                                            }}
                                            className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                                        >
                                            <LogIn className="w-3.5 h-3.5" />
                                            <span>تسجيل الدخول</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                onOpenAuthModal('signup');
                                            }}
                                            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" />
                                            <span>فتح حساب</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. SAVED RACES BUTTON */}
                        <div className="space-y-1">
                            <div className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <FolderKanban className="w-3.5 h-3.5 text-amber-500" />
                                <span>إدارة وأرشيف السباقات</span>
                            </div>

                            {onOpenSavedRaces && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onOpenSavedRaces();
                                        onClose();
                                    }}
                                    className={`w-full p-3.5 rounded-2xl text-right transition-all flex items-center justify-between border ${
                                        isInSavedRaces
                                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                                            : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            isInSavedRaces ? 'bg-black/10' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                                        }`}>
                                            <FolderKanban className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black">السباقات المنجزة</div>
                                            <div className={`text-[11px] ${isInSavedRaces ? 'text-slate-900/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                                أرشيف النتائج والترتيب المطبوع
                                            </div>
                                        </div>
                                    </div>

                                    {savedRacesCount > 0 && (
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                                            isInSavedRaces 
                                                ? 'bg-slate-900 text-white' 
                                                : 'bg-amber-400 text-slate-950'
                                        }`}>
                                            {savedRacesCount} سباق
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* 3. CLOUD RESTORE / SYNC */}
                        {onFetchCloudRunners && (
                            <div className="space-y-1">
                                <div className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <CloudDownload className="w-3.5 h-3.5 text-blue-500" />
                                    <span>المزامنة السحابية</span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="text-xs font-black text-slate-800 dark:text-white">سحابة Firebase</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono dir-ltr">{FIREBASE_PROJECT_ID}</span>
                                    </div>

                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                                        استرجاع لائحة المتسابقين المسجلة في السحابة فوراً دون الحاجة لرفع ملف Excel من جديد.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            onFetchCloudRunners();
                                            onClose();
                                        }}
                                        disabled={isCloudLoading}
                                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {isCloudLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>جاري الجلب من السحابة...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CloudDownload className="w-4 h-4 text-amber-300" />
                                                <span>استرجاع المتسابقين من Firebase</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 4. PWA APP INSTALLATION */}
                        {!isInstalled && (
                            <div className="space-y-1">
                                <div className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>تطبيق الهاتف (PWA)</span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 shadow-sm space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black">
                                            <Smartphone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-emerald-950 dark:text-emerald-300">تثبيت التطبيق على جهازك</div>
                                            <div className="text-[10px] text-emerald-700 dark:text-emerald-400">يعمل بدون إنترنت وشاشة كاملة</div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleInstallClick}
                                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                                    >
                                        <Smartphone className="w-4 h-4 text-amber-300" />
                                        <span>تثبيت التطبيق الآن</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* App Features Quick Guide */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <QrCode className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span>مسح فوري سريع لأرقام الصدريات وكاميرا QR</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>تصدير النتائج الفردية والجماعية لـ Excel و PDF</span>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                        <span>مدبر سباق العدو الريفي المدرسي 2026</span>
                    </div>

                </div>
            </div>
        </div>
    );
};
