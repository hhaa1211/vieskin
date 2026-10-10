import React from 'react';
import { 
  BookmarkPlus, 
  RotateCcw, 
  BookOpen
} from 'lucide-react';
import { GarmentLayerState } from '../../types';

interface StudioHeaderProps {
  currentLayers: GarmentLayerState;
  onSaveOutfit: () => void;
  onGoToLookbook: () => void;
  onResetOutfit?: () => void;
  lastSavedTime?: string | null;
  etiquetteScore?: number;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  currentLayers,
  onSaveOutfit,
  onGoToLookbook,
  onResetOutfit,
  lastSavedTime = 'Vừa xong'
}) => {
  const outerGarmentName = (currentLayers.layer3_outer.name || 'Cổ Phục').normalize('NFC');

  return (
    <header className="h-13 sm:h-14 bg-[#121212] border-b border-stone-800/80 px-3 sm:px-4 flex items-center justify-between text-stone-200 select-none z-30 shrink-0">
      {/* Brand & Active Ensemble Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B0000] to-[#500000] flex items-center justify-center shadow-md shadow-red-950/40 border border-[#A93226]/40 shrink-0">
            <span className="font-serif text-xs sm:text-sm font-bold text-[#FAF9F5] leading-none">VS</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase font-serif text-[#FAF9F5] shrink-0">
              Chỉnh sửa:
            </span>
            <span 
              title={outerGarmentName}
              className="text-xs font-sans font-medium text-[#D4AF37] truncate max-w-[120px] xs:max-w-[150px] sm:max-w-[200px] md:max-w-[260px]"
            >
              {outerGarmentName}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Subtle Auto-save Status (Hidden on mobile) */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-stone-400">
        <span className="text-stone-300 font-medium">Tự động đồng bộ</span>
        <span className="text-stone-600">·</span>
        <span className="text-stone-400 text-[11px]">{lastSavedTime || 'Thời gian thực'}</span>
      </div>

      {/* Right: Actions with 44px ergonomic touch targets */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onResetOutfit && (
          <button
            type="button"
            onClick={onResetOutfit}
            title="Đặt lại trang phục mặc định"
            aria-label="Đặt lại trang phục mặc định"
            className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Lookbook Button: Compact icon on mobile, with label on sm+ */}
        <button
          type="button"
          onClick={onGoToLookbook}
          title="Mở Bộ sưu tập Lookbook"
          aria-label="Mở Bộ sưu tập Lookbook"
          className="min-h-[40px] sm:min-h-[34px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 hover:border-stone-500/80 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <BookOpen className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span className="hidden sm:inline">Lookbook</span>
        </button>

        {/* Save Outfit Button: Compact icon + tag on mobile, full label on sm+ */}
        <button
          type="button"
          onClick={onSaveOutfit}
          title="Lưu Bộ Phối Vào Lookbook"
          aria-label="Lưu Bộ Phối Vào Lookbook"
          className="min-h-[40px] sm:min-h-[34px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#8B0000] to-[#C0392B] hover:from-[#A00000] hover:to-[#D93829] shadow-sm shadow-red-950/50 hover:shadow-lg hover:shadow-red-900/40 border border-red-700/50 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <BookmarkPlus className="w-4 h-4 shrink-0" />
          <span className="hidden xs:inline">Lưu Phối</span>
          <span className="hidden sm:inline">Đồ</span>
        </button>
      </div>
    </header>
  );
};

