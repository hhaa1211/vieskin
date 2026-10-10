import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ActiveTab } from '../Navigation';

interface OnboardingGuideProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onNavigate }) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vpr_onboarding_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileExpanded, setIsMobileExpanded] = useState<boolean>(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('vpr_onboarding_dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  return (
    <aside 
      aria-label="Hướng dẫn 3 bước phối đồ"
      className="bg-gradient-to-r from-rose-950/90 via-stone-900 to-amber-950/80 border-b border-rose-900/40 text-stone-100 py-1.5 sm:py-2.5 px-3 sm:px-6 relative overflow-hidden transition-all text-xs"
    >
      <div className="max-w-7xl mx-auto">
        {/* MOBILE COMPACT SINGLE-LINE VIEW (< 640px) */}
        <div className="flex sm:hidden items-center justify-between gap-2 min-h-[32px]">
          <button
            type="button"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="flex items-center gap-1.5 text-left text-[11px] text-amber-300 font-medium truncate flex-1 cursor-pointer"
            aria-expanded={isMobileExpanded}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-serif font-bold text-amber-300 shrink-0">3 Bước:</span>
            <span className="text-stone-300 truncate">1. Chọn dáng → 2. Phối phụ kiện → 3. Lookbook</span>
            {isMobileExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1" />
            )}
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('studio')}
              className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Phối ngay</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
              aria-label="Đóng hướng dẫn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* EXPANDED CONTENT ON MOBILE OR DEFAULT DESKTOP/TABLET (>= 640px) */}
        <div className={`${isMobileExpanded ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-rose-900/30 mt-1 sm:mt-0`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1.5 font-bold font-serif text-amber-300 text-xs shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quy Trình 3 Bước:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-stone-300 text-[11px]">
              <button
                type="button"
                onClick={() => onNavigate('discovery')}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer min-h-[28px]"
              >
                <span className="w-4 h-4 rounded-full bg-rose-800 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Chọn dáng Cổ phục</span>
              </button>
              <span className="text-stone-600">→</span>

              <button
                type="button"
                onClick={() => onNavigate('studio')}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer min-h-[28px]"
              >
                <span className="w-4 h-4 rounded-full bg-rose-800 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Remix phụ kiện & Soi chuẩn</span>
              </button>
              <span className="text-stone-600">→</span>

              <button
                type="button"
                onClick={() => onNavigate('lookbook')}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer min-h-[28px]"
              >
                <span className="w-4 h-4 rounded-full bg-rose-800 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Xuất Lookbook 9:16</span>
              </button>
            </div>
          </div>

          {/* Desktop CTA & Dismiss */}
          <div className="hidden sm:flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => onNavigate('studio')}
              className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Thử phối ngay</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-stone-400 hover:text-stone-200 cursor-pointer p-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
              aria-label="Đóng hướng dẫn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

