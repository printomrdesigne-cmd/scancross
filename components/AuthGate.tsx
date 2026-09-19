import React, { useState } from 'react';
import {
    Mail,
    Lock,
    User as UserIcon,
    Eye,
    EyeOff,
    LogIn,
    UserPlus,
    KeyRound,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Shield,
    Sparkles,
    Trophy
} from 'lucide-react';
import {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    resetUserPassword,
    getAuthErrorMessage
} from '../services/firebase';

interface AuthGateProps {
    onAuthSuccess?: (msg: string) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthSuccess }) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('signup');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleTabChange = (newMode: 'login' | 'signup' | 'forgot') => {
        setMode(newMode);
        setErrorMsg(null);
        setSuccessMsg(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!email.trim()) {
            setErrorMsg('يرجى إدخال البريد الإلكتروني.');
            return;
        }

        if (mode === 'forgot') {
            setLoading(true);
            try {
                await resetUserPassword(email);
                setSuccessMsg('تم إرسال رابط استرجاع كلمة المرور إلى بريدك الإلكتروني بنجاح!');
                if (onAuthSuccess) onAuthSuccess('تم إرسال رابط استرجاع كلمة المرور');
            } catch (err: any) {
                setErrorMsg(getAuthErrorMessage(err));
            } finally {
                setLoading(false);
            }
            return;
        }

        if (!password) {
            setErrorMsg('يرجى إدخال كلمة المرور.');
            return;
        }

        if (mode === 'signup') {
            if (password.length < 6) {
                setErrorMsg('يجب أن تتكون كلمة المرور من 6 خانات على الأقل.');
                return;
            }
            if (password !== confirmPassword) {
                setErrorMsg('كلمتا المرور غير متطابقتين.');
                return;
            }

            setLoading(true);
            try {
                await signUpWithEmail(email, password, name);
                if (onAuthSuccess) onAuthSuccess('تم إنشاء الحساب وتسجيل الدخول بنجاح! مرحباً بك.');
            } catch (err: any) {
                setErrorMsg(getAuthErrorMessage(err));
            } finally {
                setLoading(false);
            }
        } else if (mode === 'login') {
            setLoading(true);
            try {
                await signInWithEmail(email, password);
                if (onAuthSuccess) onAuthSuccess('تم تسجيل الدخول بنجاح');
            } catch (err: any) {
                setErrorMsg(getAuthErrorMessage(err));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleGoogleSignIn = async () => {
        setErrorMsg(null);
        setLoading(true);
        try {
            await signInWithGoogle();
            if (onAuthSuccess) onAuthSuccess('تم تسجيل الدخول بحساب Google بنجاح');
        } catch (err: any) {
            if (err?.code !== 'auth/popup-closed-by-user') {
                setErrorMsg(getAuthErrorMessage(err));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto my-6 px-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all text-slate-800 dark:text-slate-100">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-6 text-white text-center relative">
                    <div className="w-16 h-16 rounded-3xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-xl mx-auto mb-3">
                        <Trophy className="w-8 h-8 text-amber-300" />
                    </div>
                    
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                        {mode === 'signup'
                            ? 'إنشاء حساب جديد للاستخدام'
                            : mode === 'forgot'
                            ? 'استعادة كلمة المرور'
                            : 'تسجيل الدخول إلى حسابك'}
                    </h2>
                    
                    <p className="text-xs sm:text-sm text-indigo-100 font-medium mt-1 max-w-sm mx-auto">
                        {mode === 'signup'
                            ? 'يلزم فتح حساب بالبريد الإلكتروني للبدء في استخدام التطبيق وحفظ السباقات والنتائج'
                            : mode === 'forgot'
                            ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط استعادة كلمة المرور فوراً'
                            : 'أدخل بيانات حسابك للمتابعة وإدارة السباقات وحساب النتائج'}
                    </p>

                    {/* Mode switch tabs */}
                    {mode !== 'forgot' && (
                        <div className="mt-5 flex bg-black/25 p-1 rounded-2xl backdrop-blur-md border border-white/10 max-w-xs mx-auto">
                            <button
                                type="button"
                                onClick={() => handleTabChange('signup')}
                                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                    mode === 'signup'
                                        ? 'bg-white text-indigo-900 shadow-md scale-[1.02]'
                                        : 'text-white/80 hover:text-white'
                                }`}
                            >
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>فتح حساب جديد</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTabChange('login')}
                                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                    mode === 'login'
                                        ? 'bg-white text-indigo-900 shadow-md scale-[1.02]'
                                        : 'text-white/80 hover:text-white'
                                }`}
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>تسجيل الدخول</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
                    {/* Error Banner */}
                    {errorMsg && (
                        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold leading-relaxed">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Success Banner */}
                    {successMsg && (
                        <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-bold leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Notice */}
                    <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-indigo-800 dark:text-indigo-200 text-xs font-medium">
                        <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>الحساب إجباري لضمان حفظ بيانات السباقات والمتسابقين والنتائج بأمان.</span>
                    </div>

                    {/* Name (Only in Sign Up) */}
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                                الاسم الكامل أو اسم المؤسسة <span className="text-slate-400 font-normal">(اختياري)</span>
                            </label>
                            <div className="relative">
                                <UserIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="مثال: ذ. محمد الإدريسي"
                                    className="w-full pr-10 pl-3.5 py-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                            البريد الإلكتروني <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                dir="ltr"
                                className="w-full pr-10 pl-3.5 py-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-left"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    {mode !== 'forgot' && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                                    كلمة المرور <span className="text-rose-500">*</span>
                                </label>
                                {mode === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('forgot')}
                                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        نسيت كلمة المرور؟
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    dir="ltr"
                                    className="w-full pr-10 pl-10 py-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-left"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Confirm Password (Only in Sign Up) */}
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                                تأكيد كلمة المرور <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    dir="ltr"
                                    className="w-full pr-10 pl-3.5 py-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-left"
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-[0.99] text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none mt-4"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>جاري التحقق والمعالجة...</span>
                            </>
                        ) : mode === 'signup' ? (
                            <>
                                <UserPlus className="w-5 h-5 text-amber-300" />
                                <span>إنشاء الحساب وبدء الاستخدام</span>
                            </>
                        ) : mode === 'forgot' ? (
                            <>
                                <KeyRound className="w-5 h-5" />
                                <span>إرسال رابط إعادة التعيين</span>
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                <span>تسجيل الدخول وبدء الاستخدام</span>
                            </>
                        )}
                    </button>

                    {/* Forgot Mode Return Link */}
                    {mode === 'forgot' && (
                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => handleTabChange('login')}
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                العودة إلى تسجيل الدخول
                            </button>
                        </div>
                    )}

                    {/* Divider & Google Sign-In */}
                    {mode !== 'forgot' && (
                        <>
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                                <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400">أو</span>
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-black text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition flex items-center justify-center gap-2.5 disabled:opacity-60 shadow-sm"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                <span>الدخول المباشر بحساب Google</span>
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};
