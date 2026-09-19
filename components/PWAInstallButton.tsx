import React, { useState } from 'react';
import { Smartphone, Download, Share2, PlusSquare, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed as standalone app, don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="تثبيت التطبيق على الهاتف"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 ${
          isInstallable
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20 animate-pulse'
            : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:text-white'
        } ${className}`}
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
        <span className="whitespace-nowrap">تثبيت التطبيق</span>
        <Download className="w-3 h-3 opacity-80" />
      </button>

      {/* Mobile Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-toast-in no-print">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 text-white relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">تثبيت التطبيق على الهاتف</h3>
                  <p className="text-[11px] text-slate-400">يعمل بدون إنترنت وتجربة تطبيق أصلي (PWA)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* App Preview Card */}
            <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-3">
              <img src="/pwa-192x192.png" alt="App Icon" className="w-12 h-12 rounded-xl shadow-md" />
              <div>
                <div className="text-sm font-black text-white">مدبر سباق العدو الريفي</div>
                <div className="text-xs text-amber-400 font-medium">نسخة الهاتف المتقدمة 2026</div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span className="flex items-center gap-0.5 text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> آمن ومجاني
                  </span>
                  <span>•</span>
                  <span>سريع ومستقر</span>
                </div>
              </div>
            </div>

            {/* Platform instructions */}
            <div className="mt-4 space-y-3">
              {isIOS ? (
                /* iOS Safari Instructions */
                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50 space-y-2.5 text-xs text-slate-300">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>خطوات التثبيت على iPhone و iPad (متصفح Safari):</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">1</span>
                    <p className="leading-tight">
                      اضغط على زر المشاركة <Share2 className="inline w-3.5 h-3.5 mx-1 text-sky-400" /> في شريط متصفح Safari أسفل الشاشة.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">2</span>
                    <p className="leading-tight">
                      مرر للأسفل واختر <span className="font-bold text-white bg-slate-700 px-1.5 py-0.5 rounded">إضافة إلى الشاشة الرئيسية (Add to Home Screen)</span> <PlusSquare className="inline w-3.5 h-3.5 mx-1 text-emerald-400" />.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">3</span>
                    <p className="leading-tight">
                      اضغط على <span className="font-bold text-white">إضافة (Add)</span> في الأعلى، وسيظهر رمز التطبيق على شاشتك الرئيسية كأي تطبيق عادي.
                    </p>
                  </div>
                </div>
              ) : (
                /* Android / Chrome Instructions */
                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50 space-y-2.5 text-xs text-slate-300">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>خطوات التثبيت على هواتف Android (Chrome / Samsung Internet):</span>
                  </div>
                  {isInstallable ? (
                    <div className="text-center py-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await install();
                          setShowGuideModal(false);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>اضغط هنا للتثبيت الفوري</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">1</span>
                        <p className="leading-tight">
                          اضغط على قائمة الخيارات <span className="font-bold text-white">(⋮ ثلاث نقاط)</span> بأعلى يمين متصفح Chrome.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">2</span>
                        <p className="leading-tight">
                          اختر <span className="font-bold text-white bg-slate-700 px-1.5 py-0.5 rounded">تثبيت التطبيق (Install app)</span> أو <span className="font-bold text-white bg-slate-700 px-1.5 py-0.5 rounded">إضافة إلى الشاشة الرئيسية</span>.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">3</span>
                        <p className="leading-tight">
                          قم بتأكيد التثبيت ليفتح التطبيق في نافذة مستقلة وبشاشة كاملة دون الحاجة لفتح المتصفح.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Benefits feature list */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-800/40 p-2 rounded-lg border border-slate-700/40">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>استخدام كامل دون متصفح</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/40 p-2 rounded-lg border border-slate-700/40">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>كاميرا مسح QR سريعة</span>
                </div>
              </div>
            </div>

            {/* Footer Close Button */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
