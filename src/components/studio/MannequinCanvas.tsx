import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Split, 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle,
  MoreHorizontal,
  X,
  BookmarkPlus
} from 'lucide-react';
import { Avatar2DCanvas } from '../canvas/Avatar2DCanvas';
import { 
  GarmentLayerState, 
  MannequinSettings, 
  DynamicLayerItem 
} from '../../types';

interface MannequinCanvasProps {
  currentLayers: GarmentLayerState;
  mannequin: MannequinSettings;
  onUpdateMannequin?: (settings: MannequinSettings) => void;
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string | null) => void;
  onUpdateLayerTransform?: (layerId: string, transform: { x: number; y: number; scale: number; rotation: number }) => void;
  onRemoveLayer?: (layerId: string) => void;
  onToggleLayerLock?: (layerId: string) => void;
  onToggleLayerVisibility?: (layerId: string) => void;
  onLapelToggle: () => void;
  onDropItem: (target: 'A' | 'B', item: any) => void;
  // AI Fusion
  enableAiFusion?: boolean;
  onToggleAiFusion?: () => void;
  // Toolbar controls
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  // A/B Compare state
  isSplitMode: boolean;
  onToggleSplitMode: () => void;
  outfitB: GarmentLayerState;
  activeTarget: 'A' | 'B';
  onSetActiveTarget: (target: 'A' | 'B') => void;
  onCloneAToB: () => void;
  onSelectWinnerB: () => void;
  onSaveOutfit?: () => void;
}

export const MannequinCanvas: React.FC<MannequinCanvasProps> = ({
  currentLayers,
  mannequin,
  onUpdateMannequin,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayerTransform,
  onRemoveLayer,
  onToggleLayerLock,
  onToggleLayerVisibility,
  onLapelToggle,
  onDropItem,
  enableAiFusion = true,
  onToggleAiFusion,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  isSplitMode,
  onToggleSplitMode,
  outfitB,
  activeTarget,
  onSetActiveTarget,
  onCloneAToB,
  onSelectWinnerB,
  onSaveOutfit
}) => {
  const isRightOverLeftA = currentLayers.layer3_outer.lapelDirection === 'right_over_left';
  const isRightOverLeftB = outfitB.layer3_outer.lapelDirection === 'right_over_left';
  const currentLapelCorrect = isSplitMode && activeTarget === 'B' ? isRightOverLeftB : isRightOverLeftA;

  const currentGender = mannequin.genderPresentation || 'female';

  // Mobile Compact Toolbar State (3-dot menu)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const handleSliderPointerMove = (e: React.PointerEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleGenderToggle = (gender: 'female' | 'male' | 'androgynous') => {
    if (onUpdateMannequin) {
      onUpdateMannequin({ ...mannequin, genderPresentation: gender });
    }
  };

  return (
    <div className="flex-1 relative flex flex-col items-center justify-center bg-[#101010] overflow-hidden select-none">
      {/* Background Editorial Studio Spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900/60 via-[#101010] to-[#0a0a0a]" />

      {/* Floating Glassmorphic Pill Toolbar at Top Center */}
      <div className="absolute top-2 sm:top-4 z-40 max-w-[96vw] flex items-center justify-center">
        {/* DESKTOP FULL TOOLBAR (sm:flex) */}
        <div className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-full bg-[#1c1c1c]/95 border border-stone-800/90 shadow-2xl backdrop-blur-xl text-stone-200">
          {/* Mannequin Gender Quick Switcher (Nữ / Nam) */}
          {onUpdateMannequin && (
            <div className="flex items-center bg-stone-900/90 p-0.5 rounded-full border border-stone-700/80 shrink-0">
              <button
                type="button"
                onClick={() => handleGenderToggle('female')}
                title="Đổi sang Ma-nơ-canh Nữ"
                aria-label="Đổi sang Ma-nơ-canh Nữ"
                className={`min-h-[30px] px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                  currentGender === 'female'
                    ? 'bg-rose-900/90 text-rose-200 border border-rose-500/60 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>♀ Nữ</span>
              </button>
              <button
                type="button"
                onClick={() => handleGenderToggle('male')}
                title="Đổi sang Ma-nơ-canh Nam"
                aria-label="Đổi sang Ma-nơ-canh Nam"
                className={`min-h-[30px] px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                  currentGender === 'male'
                    ? 'bg-amber-900/90 text-amber-200 border border-amber-500/60 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>♂ Nam</span>
              </button>
            </div>
          )}

          {onUpdateMannequin && <div className="w-px h-4 bg-stone-700/60 mx-0.5 shrink-0" />}

          {/* Undo / Redo */}
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            title="Hoàn tác (Ctrl+Z)"
            aria-label="Hoàn tác"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0 active:scale-95"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            title="Làm lại (Ctrl+Y)"
            aria-label="Làm lại"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0 active:scale-95"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-stone-700/60 mx-0.5 shrink-0" />

          {/* A/B Compare Toggle */}
          <button
            type="button"
            onClick={onToggleSplitMode}
            title="Chế độ so sánh A / B"
            aria-label="Chế độ so sánh A / B"
            className={`min-h-[30px] flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 active:scale-95 ${
              isSplitMode
                ? 'bg-[#8B0000] text-white border border-red-700/80 shadow-inner'
                : 'hover:bg-stone-800 text-stone-300 hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>So Sánh</span>
          </button>

          {/* Reset Canvas */}
          <button
            type="button"
            onClick={onReset}
            title="Đặt lại bản phối"
            aria-label="Đặt lại bản phối"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer shrink-0 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Save Outfit Button on Desktop */}
          {onSaveOutfit && (
            <button
              type="button"
              onClick={onSaveOutfit}
              title="Lưu bản phối vào Lookbook"
              aria-label="Lưu bản phối vào Lookbook"
              className="min-h-[30px] flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#8B0000] to-[#C0392B] hover:from-[#A00000] hover:to-[#D93829] text-white border border-red-700/60 shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-amber-300" />
              <span>Lưu</span>
            </button>
          )}
        </div>

        {/* MOBILE COMPACT TOOLBAR (sm:hidden) */}
        <div className="sm:hidden relative">
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#1c1c1c]/95 border border-stone-800/90 shadow-xl backdrop-blur-xl text-stone-200">
            {/* Quick Gender Toggle on Mobile */}
            {onUpdateMannequin && (
              <button
                type="button"
                onClick={() => handleGenderToggle(currentGender === 'female' ? 'male' : 'female')}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-900 border border-stone-700 text-amber-300 flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
              >
                <span>{currentGender === 'female' ? '♀ Nữ' : '♂ Nam'}</span>
              </button>
            )}

            {/* Quick Undo */}
            <button
              type="button"
              disabled={!canUndo}
              onClick={onUndo}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-800 disabled:opacity-30 text-stone-300 cursor-pointer active:scale-95 shrink-0"
              title="Hoàn tác"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            {/* Quick Save on Mobile */}
            {onSaveOutfit && (
              <button
                type="button"
                onClick={onSaveOutfit}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-[#8B0000] to-[#B91C1C] text-white flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm shrink-0"
                title="Lưu bản phối"
              >
                <BookmarkPlus className="w-3 h-3 text-amber-300" />
                <span>Lưu</span>
              </button>
            )}

            {/* 3-Dot More Options Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-800 text-amber-400 border border-stone-700/80 cursor-pointer active:scale-95 shrink-0"
              aria-label="Mở công cụ phụ"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
            </button>
          </div>

          {/* Expanded Floating Dropdown Sheet on Mobile (Contained within viewport, zero overflow) */}
          {isMobileMenuOpen && (
            <div className="absolute top-11 right-0 w-48 max-w-[calc(100vw-1.5rem)] bg-[#181818] border border-stone-700/90 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl text-xs space-y-1 z-50 animate-fadeIn">
              {onSaveOutfit && (
                <button
                  type="button"
                  onClick={() => { onSaveOutfit(); setIsMobileMenuOpen(false); }}
                  className="w-full px-3 py-2 rounded-xl flex items-center gap-2 bg-gradient-to-r from-red-950/80 to-amber-950/80 text-amber-300 hover:text-amber-200 cursor-pointer font-bold border border-red-800/60"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Lưu vào Lookbook</span>
                </button>
              )}

              <button
                type="button"
                disabled={!canRedo}
                onClick={() => { onRedo(); setIsMobileMenuOpen(false); }}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-stone-800 text-stone-300 hover:text-white cursor-pointer disabled:opacity-40"
              >
                <Redo2 className="w-3.5 h-3.5 text-stone-400" />
                <span>Làm lại (Redo)</span>
              </button>

              <button
                type="button"
                onClick={() => { onToggleSplitMode(); setIsMobileMenuOpen(false); }}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-stone-800 text-stone-300 hover:text-white cursor-pointer"
              >
                <Split className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Chế độ So Sánh A/B</span>
              </button>

              <button
                type="button"
                onClick={() => { onReset(); setIsMobileMenuOpen(false); }}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-stone-800 text-red-400 hover:text-red-300 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại bản phối</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Viewport Area: Scaled dynamically with full viewport height */}
      <div className={`w-full h-full flex items-center justify-center p-1 sm:p-4 ${isSplitMode ? 'pt-22 sm:pt-20' : 'pt-12 sm:pt-14'} max-h-full`}>
        {!isSplitMode ? (
          /* Single Editorial Focus Canvas: aspect 3/4 object-contain */
          <div 
            className="w-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl h-full max-h-[calc(100%-0.5rem)] aspect-[3/4] flex items-center justify-center relative rounded-2xl overflow-hidden border border-stone-800/60 bg-gradient-to-b from-[#161616] to-[#0e0e0e] shadow-2xl"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              try {
                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (data) onDropItem('A', data);
              } catch {}
            }}
          >
            <Avatar2DCanvas
              layers={currentLayers}
              mannequin={mannequin}
              selectedLayerId={selectedLayerId}
              onSelectLayer={onSelectLayer}
              onUpdateLayerTransform={onUpdateLayerTransform}
              onRemoveLayer={onRemoveLayer}
              onToggleLayerLock={onToggleLayerLock}
              onToggleLayerVisibility={onToggleLayerVisibility}
              onLapelToggle={onLapelToggle}
              enableAiFusion={enableAiFusion}
              onToggleAiFusion={onToggleAiFusion}
              showControls={false}
              className="w-full h-full"
            />
          </div>
        ) : (
          /* A/B Comparison Split Workstation */
          <div className="w-full h-full flex flex-col gap-2 max-w-6xl">
            {/* Active Target Selector Header Bar */}
            <div className="w-full flex items-center justify-between bg-[#181818] p-1.5 px-2.5 rounded-xl border border-stone-800/90 shadow-xl backdrop-blur-md overflow-x-auto text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-300 font-serif hidden sm:inline">Tiêu điểm chỉnh sửa:</span>
                <button
                  type="button"
                  onClick={() => onSetActiveTarget('A')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTarget === 'A'
                      ? 'bg-[#8B0000] text-white ring-2 ring-red-500/50 shadow-md shadow-red-950/50'
                      : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${activeTarget === 'A' ? 'bg-red-400 animate-ping' : 'bg-stone-600'}`} />
                  <span>[Phương án A]</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSetActiveTarget('B')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTarget === 'B'
                      ? 'bg-[#D4AF37] text-stone-950 ring-2 ring-amber-400/50 shadow-md shadow-amber-950/50'
                      : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${activeTarget === 'B' ? 'bg-amber-600 animate-ping' : 'bg-stone-600'}`} />
                  <span>[Phương án B ]</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCloneAToB}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700/80 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                  title="Sao chép toàn bộ trang phục từ A sang B để tiện so sánh chi tiết"
                >
                  <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Nhân bản nhanh (A → B)</span>
                </button>
              </div>
            </div>

            {/* MOBILE ONLY: Central Vertical Slider Comparison (NO Side-by-side on mobile) */}
            <div className="flex md:hidden flex-1 flex-col items-center justify-center min-h-0 relative">
              <div 
                ref={sliderRef}
                onPointerMove={(e) => { if (e.buttons === 1) handleSliderPointerMove(e); }}
                onPointerDown={handleSliderPointerMove}
                className="w-full max-w-xs h-full aspect-[3/4] relative rounded-2xl overflow-hidden border border-stone-800 bg-[#161616] shadow-2xl select-none touch-none cursor-ew-resize"
              >
                {/* Outfit A Base Canvas */}
                <div className="absolute inset-0">
                  <Avatar2DCanvas
                    layers={currentLayers}
                    mannequin={mannequin}
                    selectedLayerId={activeTarget === 'A' ? selectedLayerId : null}
                    onSelectLayer={onSelectLayer}
                    onUpdateLayerTransform={onUpdateLayerTransform}
                    onRemoveLayer={onRemoveLayer}
                    onToggleLayerLock={onToggleLayerLock}
                    onToggleLayerVisibility={onToggleLayerVisibility}
                    onLapelToggle={onLapelToggle}
                    enableAiFusion={enableAiFusion}
                    onToggleAiFusion={onToggleAiFusion}
                    showControls={false}
                    className="w-full h-full"
                  />
                  <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded text-[10px] font-bold bg-[#8B0000] text-white">
                    Bộ A
                  </span>
                </div>

                {/* Outfit B Overlaid Canvas (Clipped by slider position) */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
                >
                  <Avatar2DCanvas
                    layers={outfitB}
                    mannequin={mannequin}
                    selectedLayerId={activeTarget === 'B' ? selectedLayerId : null}
                    onSelectLayer={onSelectLayer}
                    onUpdateLayerTransform={onUpdateLayerTransform}
                    onRemoveLayer={onRemoveLayer}
                    onToggleLayerLock={onToggleLayerLock}
                    onToggleLayerVisibility={onToggleLayerVisibility}
                    onLapelToggle={onLapelToggle}
                    enableAiFusion={enableAiFusion}
                    onToggleAiFusion={onToggleAiFusion}
                    showControls={false}
                    className="w-full h-full"
                  />
                  <span className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37] text-stone-950">
                    Bộ B
                  </span>
                </div>

                {/* Vertical Slider Divider Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-[#D4AF37] z-30 pointer-events-none shadow-[0_0_10px_rgba(212,175,55,0.8)]"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1c1c1c] border-2 border-[#D4AF37] text-[#D4AF37] flex items-center justify-center shadow-2xl text-xs font-bold">
                    ↔
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-amber-300/80 font-medium mt-1 text-center">
                👈 Kéo thanh trượt để so sánh Bộ A (Trái) & Bộ B (Phải) 👉
              </p>
            </div>

            {/* DESKTOP / TABLET ONLY: Side-by-side Dual Workstation (md:grid) */}
            <div className="hidden md:grid flex-1 grid-cols-2 gap-4 min-h-0">
              {/* Variant A */}
              <div 
                onClick={() => onSetActiveTarget('A')}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  try {
                    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                    if (data) onDropItem('A', data);
                  } catch {}
                }}
                className={`relative rounded-2xl overflow-hidden border transition-all flex flex-col bg-gradient-to-b from-[#161616] to-[#0e0e0e] shadow-xl cursor-pointer ${
                  activeTarget === 'A'
                    ? 'border-[#8B0000] ring-2 ring-[#8B0000]/60 shadow-red-950/30'
                    : 'border-stone-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-serif font-bold bg-[#8B0000] text-white shadow-md">
                    Phương án A
                  </span>
                  {activeTarget === 'A' && (
                    <span className="text-[10px] bg-red-950/80 border border-red-700/60 text-red-300 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                      ● Đang thao tác
                    </span>
                  )}
                  <span className="text-[11px] text-stone-400 hidden md:inline">
                    {currentLayers.layer3_outer.name}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center p-2">
                  <Avatar2DCanvas
                    layers={currentLayers}
                    mannequin={mannequin}
                    selectedLayerId={activeTarget === 'A' ? selectedLayerId : null}
                    onSelectLayer={onSelectLayer}
                    onUpdateLayerTransform={onUpdateLayerTransform}
                    onRemoveLayer={onRemoveLayer}
                    onToggleLayerLock={onToggleLayerLock}
                    onToggleLayerVisibility={onToggleLayerVisibility}
                    onLapelToggle={onLapelToggle}
                    enableAiFusion={enableAiFusion}
                    onToggleAiFusion={onToggleAiFusion}
                    showControls={false}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Variant B */}
              <div 
                onClick={() => onSetActiveTarget('B')}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  try {
                    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                    if (data) onDropItem('B', data);
                  } catch {}
                }}
                className={`relative rounded-2xl overflow-hidden border transition-all flex flex-col bg-gradient-to-b from-[#161616] to-[#0e0e0e] shadow-xl cursor-pointer ${
                  activeTarget === 'B'
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/60 shadow-amber-950/30'
                    : 'border-stone-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-serif font-bold bg-[#D4AF37] text-stone-950 shadow-md">
                    Phương án B
                  </span>
                  {activeTarget === 'B' && (
                    <span className="text-[10px] bg-amber-950/80 border border-amber-700/60 text-amber-300 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                      ● Đang thao tác
                    </span>
                  )}
                  <span className="text-[11px] text-stone-400 hidden md:inline">
                    {outfitB.layer3_outer.name}
                  </span>
                </div>

                {/* Action Buttons for B */}
                <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWinnerB();
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-[#D4AF37] hover:bg-[#b8952b] text-stone-950 font-bold cursor-pointer shadow-md transition-all active:scale-95"
                    title="Chọn B làm bộ phối chính"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Áp dụng B</span>
                  </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-2">
                  <Avatar2DCanvas
                    layers={outfitB}
                    mannequin={mannequin}
                    selectedLayerId={activeTarget === 'B' ? selectedLayerId : null}
                    onSelectLayer={onSelectLayer}
                    onUpdateLayerTransform={onUpdateLayerTransform}
                    onRemoveLayer={onRemoveLayer}
                    onToggleLayerLock={onToggleLayerLock}
                    onToggleLayerVisibility={onToggleLayerVisibility}
                    onLapelToggle={onLapelToggle}
                    enableAiFusion={enableAiFusion}
                    onToggleAiFusion={onToggleAiFusion}
                    showControls={false}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
