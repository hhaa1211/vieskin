import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showRestored, setShowRestored] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showRestored) {
    return (
      <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-1.5 transition-all">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Kết nối Internet đã được phục hồi! Đồng bộ dữ liệu hoàn tất.</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Đang chạy ngoại tuyến · Bản vẽ và bộ sưu tập của bạn được tự động lưu nháp an toàn trên thiết bị.</span>
    </div>
  );
};
