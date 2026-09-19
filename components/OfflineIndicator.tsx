import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 text-white px-3.5 py-2 text-xs font-bold shadow-xl border border-amber-400/40 backdrop-blur animate-toast-in no-print">
        <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
        <span>وضع عدم الاتصال — يمكنك الاستمرار ومسح وتدبير السباق محلياً.</span>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600/95 text-white px-3.5 py-2 text-xs font-bold shadow-xl border border-emerald-400/40 backdrop-blur animate-toast-in no-print">
        <Wifi className="w-4 h-4 text-emerald-200" />
        <span>تم استعادة الاتصال بالإنترنت بنجاح.</span>
      </div>
    );
  }

  return null;
};
