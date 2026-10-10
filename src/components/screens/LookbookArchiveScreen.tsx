import React, { useState, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  Download, 
  Share2, 
  QrCode, 
  Layers, 
  MapPin, 
  Calendar, 
  Tag, 
  Trash2, 
  Check, 
  Copy, 
  FolderArchive, 
  Palette, 
  Compass, 
  SlidersHorizontal,
  Bookmark,
  Heart,
  Search,
  X,
  Plus,
  Loader2
} from 'lucide-react';
import { Avatar2DCanvas } from '../canvas/Avatar2DCanvas';
import { UndoToast } from '../common/UndoToast';
import { LOOKBOOK_ENVIRONMENTS, WARDROBE_ITEMS, CURATED_FABRICS } from '../../data/culturalData';
import { SavedOutfit, ExtractedAsset, GarmentLayerState, MannequinSettings } from '../../types';

interface LookbookArchiveScreenProps {
  savedOutfits: SavedOutfit[];
  onLoadOutfitToStudio: (outfit: SavedOutfit) => void;
  onDeleteOutfit: (id: string) => void;
  extractedAssets: ExtractedAsset[];
}

export const LookbookArchiveScreen: React.FC<LookbookArchiveScreenProps> = ({
  savedOutfits,
  onLoadOutfitToStudio,
  onDeleteOutfit,
  extractedAssets
}) => {
  // Active Tab: Lookbook Creator vs Asset Repository
  const [activeTab, setActiveTab] = useState<'lookbook' | 'repository'>('lookbook');

  // Defensive Destructive Action: Pending Delete for Undo Toast
  const [pendingDeleteOutfit, setPendingDeleteOutfit] = useState<SavedOutfit | null>(null);

  // Optimistic Likes State
  const [likedOutfitIds, setLikedOutfitIds] = useState<Record<string, boolean>>({});

  // Repository Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterFamily, setFilterFamily] = useState<string>('all');

  // Filter out pending deleted outfit for instantaneous (0ms) feedback
  const visibleSavedOutfits = useMemo(() => {
    return savedOutfits.filter(o => o.id !== pendingDeleteOutfit?.id);
  }, [savedOutfits, pendingDeleteOutfit]);

  // Currently Selected Outfit for Lookbook Mockup
  const [selectedOutfit, setSelectedOutfit] = useState<SavedOutfit>(() => {
    return visibleSavedOutfits[0] || {
      id: 'default_look',
      title: 'Áo Tấc Thủy Lam x Chunky Streetwear',
      concept: 'Bản phối giao thoa Cố đô Huế và phong cách đường phố đương đại của sinh viên thế hệ mới.',
      createdAt: 'Hôm nay',
      occasion: 'yearbook_graduation',
      layers: {
        layer1_inner: { id: 'yem_dao', name: 'Yếm Đào', color: '#DC2626', visible: true },
        layer2_bottom: { id: 'quan_linh_den', name: 'Quần Lĩnh Đen', color: '#0F172A', type: 'trousers' },
        layer3_outer: {
          id: 'ao_tac',
          name: 'Áo Tấc (Ngũ Thân Tay Thụng)',
          family: 'ao_tac',
          robeColor: '#1E3A8A',
          collarColor: '#FAF9F5',
          trimColor: '#D97706',
          patternType: 'thuy_ba',
          lapelDirection: 'right_over_left'
        },
        layer4_tradAccessory: { headwearId: 'khan_van_den', headwearName: 'Khăn Vấn Nhung' },
        layer5_modernAccessory: { footwearId: 'chunky_sneakers', eyewearId: 'kinh_ram_retro', bagId: 'canvas_tote' }
      },
      mannequin: {
        bodyProportion: 'balanced',
        skinTone: '#F5D0B5',
        genderPresentation: 'female',
        heightScale: 1.0
      },
      fiveElementHarmony: {
        element: 'Thủy',
        score: 95,
        explanation: 'Thủy sinh Mộc - màu chàm hòa quyện vàng kim'
      },
      etiquetteScore: 100,
      likesCount: 12
    };
  });

  // Keep selected outfit valid if previous was deleted
  React.useEffect(() => {
    if (visibleSavedOutfits.length > 0) {
      if (!selectedOutfit || selectedOutfit.id === pendingDeleteOutfit?.id) {
        const nextSelected = visibleSavedOutfits.find(o => o.id !== pendingDeleteOutfit?.id) || visibleSavedOutfits[0];
        if (nextSelected && selectedOutfit?.id !== nextSelected.id) {
          setSelectedOutfit(nextSelected);
        }
      }
    }
  }, [visibleSavedOutfits, pendingDeleteOutfit, selectedOutfit]);

  // Selected Environment for Mockup
  const [selectedEnvId, setSelectedEnvId] = useState<string>('hoi_an');
  const activeEnv = LOOKBOOK_ENVIRONMENTS.find(e => e.id === selectedEnvId) || LOOKBOOK_ENVIRONMENTS[0];

  // Repository Wardrobe Subcategory
  const [repoCategory, setRepoCategory] = useState<'outfits' | 'outer' | 'bottoms' | 'accessories' | 'fabrics'>('outfits');

  // Export / Copy Feedback
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Filtered Outfits in Repository
  const filteredRepositoryOutfits = useMemo(() => {
    return visibleSavedOutfits.filter(outfit => {
      const matchSearch = outfit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.layers.layer3_outer.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFamily = filterFamily === 'all' || outfit.layers.layer3_outer.family === filterFamily;
      return matchSearch && matchFamily;
    });
  }, [visibleSavedOutfits, searchQuery, filterFamily]);

  // Defensive Delete Handlers (Undo Toast pattern)
  const handleDeleteClick = (outfit: SavedOutfit) => {
    if (pendingDeleteOutfit) {
      onDeleteOutfit(pendingDeleteOutfit.id);
    }
    setPendingDeleteOutfit(outfit);
  };

  const handleConfirmUndo = () => {
    setPendingDeleteOutfit(null);
  };

  const handleFinalizeDelete = () => {
    if (pendingDeleteOutfit) {
      onDeleteOutfit(pendingDeleteOutfit.id);
      setPendingDeleteOutfit(null);
    }
  };

  // Optimistic Like Handler
  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedOutfitIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy shareable link / preset
  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}?preset=${encodeURIComponent(selectedOutfit.id)}&env=${selectedEnvId}`
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // High-Resolution 9:16 PNG Card Export via HTML5 Canvas
  const handleExportStoryPNG = () => {
    setIsDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsDownloading(false);
      return;
    }

    // Background Gradient based on chosen environment
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    if (selectedEnvId === 'hoi_an') {
      gradient.addColorStop(0, '#451A03');
      gradient.addColorStop(0.5, '#78350F');
      gradient.addColorStop(1, '#1C1917');
    } else if (selectedEnvId === 'khue_van_cac') {
      gradient.addColorStop(0, '#450A0A');
      gradient.addColorStop(0.6, '#1C1917');
      gradient.addColorStop(1, '#0C0A09');
    } else if (selectedEnvId === 'ngo_mon_hue') {
      gradient.addColorStop(0, '#3B0764');
      gradient.addColorStop(0.6, '#1E1B4B');
      gradient.addColorStop(1, '#0F172A');
    } else {
      gradient.addColorStop(0, '#064E3B');
      gradient.addColorStop(0.6, '#1C1917');
      gradient.addColorStop(1, '#0C0A09');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative Traditional Border Hairline
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 980, 1820);

    // Header Typography
    ctx.fillStyle = '#FAF9F5';
    ctx.font = 'bold 38px Lora, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('VIESKIN · LOOKBOOK', 540, 140);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`${activeEnv.name} · ${activeEnv.subtitle}`, 540, 190);

    // Outfit Title
    ctx.font = 'bold 56px Lora, Georgia, serif';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText(selectedOutfit.title, 540, 290);

    // Metadata Badges Row
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(
      `Cổ phục: ${selectedOutfit.layers.layer3_outer.name} · Ngũ Hành: ${selectedOutfit.fiveElementHarmony.element} · Chuẩn mực: ${selectedOutfit.etiquetteScore}/100`,
      540,
      350
    );

    // Simulated Central Mannequin Silhouette Card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(140, 420, 800, 1100, 30);
    ctx.fill();

    ctx.font = 'italic 28px Lora, Georgia, serif';
    ctx.fillStyle = '#FAF9F5';
    ctx.fillText(selectedOutfit.concept, 540, 1420);

    // Footer & Interactive Scannable QR Code Box
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(100, 1620, 880, 190, 24);
    ctx.fill();

    // QR Simulated Pixels
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(140, 1650, 130, 130);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(155, 1665, 30, 30);
    ctx.fillRect(225, 1665, 30, 30);
    ctx.fillRect(155, 1735, 30, 30);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 30px Lora, Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('Quét QR để mở và remix bộ phục sức này', 300, 1705);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Nền tảng VieSkin · Gen Z', 300, 1745);

    // Download PNG
    const link = document.createElement('a');
    link.download = `VieSkin_${selectedOutfit.title.replace(/\s+/g, '_')}_Story.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsDownloading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* HEADER & TOP TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-xs text-rose-800 dark:text-rose-400 font-semibold mb-1">
            Bộ Sưu Tập Cổ Phục
          </h2>
        </div>

        {/* View Switcher: Collection Creator vs Asset Repository */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('lookbook')}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'lookbook'
                ? 'bg-white dark:bg-stone-800 text-rose-700 dark:text-rose-300 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trình Tạo Bộ Sưu Tập</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('repository')}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'repository'
                ? 'bg-white dark:bg-stone-800 text-rose-700 dark:text-rose-300 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Tủ Đồ Đã Lưu ({savedOutfits.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: AUTOMATED COLLECTION CREATOR (9:16 STORY PREVIEW)       */}
      {/* ============================================================== */}
      {activeTab === 'lookbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column (Environment, Metadata, Outfit selector) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* 1. Chọn Trang Phục Từ Danh Sách Đã Phối */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Chọn Bộ Trang Phục Trong Bộ Sưu Tập:
                </span>
                <span className="text-[11px] text-stone-400 font-medium">
                  {visibleSavedOutfits.length} bộ phối
                </span>
              </div>

              {visibleSavedOutfits.length === 0 ? (
                <div className="text-center py-6 px-4 bg-stone-50 dark:bg-stone-950 rounded-xl border border-dashed border-stone-300 dark:border-stone-800 space-y-3">
                  <FolderArchive className="w-8 h-8 text-stone-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">Chưa có bộ phối nào được lưu</p>
                    <p className="text-[11px] text-stone-500">Hãy vào Studio để sáng tạo bản phối Việt Phục cách tân của riêng bạn.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onLoadOutfitToStudio(selectedOutfit)}
                    className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Vào Studio phối đồ</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {visibleSavedOutfits.map((outfit) => (
                    <button
                      key={outfit.id}
                      type="button"
                      onClick={() => setSelectedOutfit(outfit)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                        selectedOutfit.id === outfit.id
                          ? 'border-rose-600 bg-rose-50/70 dark:bg-rose-950/40 ring-1 ring-rose-500 shadow-xs'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 block truncate">
                          {outfit.title}
                        </span>
                        <span className="text-xs text-stone-500 block truncate">
                          {outfit.layers.layer3_outer.name} · {outfit.createdAt}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                        {outfit.fiveElementHarmony.element} ({outfit.etiquetteScore}đ)
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Chọn Bối Cảnh Mockup Thực Tế (Background Environments) */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Bối Cảnh Không Gian Chụp Ảnh:
                </span>
                <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold">
                  {activeEnv.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LOOKBOOK_ENVIRONMENTS.map((env) => (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => setSelectedEnvId(env.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedEnvId === env.id
                        ? 'border-rose-600 bg-rose-50/60 dark:bg-rose-950/40 ring-1 ring-rose-500'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {env.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 block line-clamp-1">{env.subtitle}</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block">
                      Khí chất: {env.atmosphere}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Metadata Badges Tự Động Tạo */}
            <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2.5 text-xs">
              <span className="font-bold text-stone-700 dark:text-stone-300 block">
                Metadata Badges Tự Động Định Danh:
              </span>
              <div className="flex flex-wrap gap-2 text-stone-700 dark:text-stone-300">
                <span className="px-2.5 py-1 bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-800 font-medium">
                  Cổ phục: {selectedOutfit.layers.layer3_outer.name}
                </span>
                <span className="px-2.5 py-1 bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-800 font-medium text-amber-700 dark:text-amber-400">
                  Hệ Ngũ Hành: {selectedOutfit.fiveElementHarmony.element}
                </span>
                <span className="px-2.5 py-1 bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-800 font-medium text-emerald-700 dark:text-emerald-400">
                  Chuẩn mực: {selectedOutfit.etiquetteScore}/100
                </span>
                <span className="px-2.5 py-1 bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-800 font-medium">
                  Bối cảnh: {activeEnv.name}
                </span>
              </div>
            </div>

            {/* 4. Hành Động Xuất File & Chia Sẻ */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportStoryPNG}
                disabled={isDownloading}
                className="flex-1 min-h-[44px] py-3 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 disabled:opacity-75 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isDownloading ? 'Đang kết xuất Story 9:16...' : 'Tải Ảnh Dọc Story / Reels (9:16)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="min-h-[44px] py-3 px-4 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{isCopied ? 'Đã sao chép link' : 'Chia sẻ Bộ sưu tập'}</span>
              </button>
            </div>
          </div>

          {/* Lookbook 9:16 Canvas Mockup Frame */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[380px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-800 dark:border-stone-700 flex flex-col justify-between p-6 select-none bg-stone-950">
              
              {/* Dynamic Environment Atmosphere Layer */}
              <div className={`absolute inset-0 bg-gradient-to-b ${activeEnv.bgGradient} opacity-90`} />
              
              {/* Cultural Watermark Pattern */}
              <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
                <div className="w-72 h-72 rounded-full border border-amber-300 border-dashed animate-spin-slow" />
              </div>

              {/* Story Top Header Card */}
              <div className="relative z-10 space-y-1 text-center">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-300/90 block">
                  VIESKIN · LOOKBOOK
                </span>
                <h3 className="font-serif text-xl font-bold text-white drop-shadow-md">
                  {selectedOutfit.title}
                </h3>
                <div className="text-[11px] text-stone-300 flex items-center justify-center gap-2">
                  <span>{activeEnv.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedOutfit.layers.layer3_outer.name}</span>
                </div>
              </div>

              {/* Central Mannequin 2D Silhouette Canvas */}
              <div className="relative z-10 my-auto flex items-center justify-center">
                <div className="w-[280px]">
                  <Avatar2DCanvas
                    layers={selectedOutfit.layers}
                    mannequin={selectedOutfit.mannequin}
                    readOnly={true}
                    className="drop-shadow-2xl"
                  />
                </div>
              </div>

              {/* Story Bottom Card with Scannable QR Code */}
              <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-serif font-bold text-white block">
                      Khí chất Ngũ Hành: {selectedOutfit.fiveElementHarmony.element}
                    </span>
                    <span className="text-[10px] text-stone-300 block line-clamp-1">
                      {selectedOutfit.concept}
                    </span>
                  </div>

                  {/* Scannable QR Code Vector Mock */}
                  <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 shadow">
                    <QrCode className="w-full h-full text-stone-900" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] text-amber-300/80 pt-1 border-t border-white/10">
                  <span>Chuẩn mực Hữu nhiệm: {selectedOutfit.etiquetteScore}%</span>
                  <span>Quét QR để Remix lại bộ này</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CATEGORIZED ASSET REPOSITORY (WARDROBE DIRECTORIES)     */}
      {/* ============================================================== */}
      {activeTab === 'repository' && (
        <div className="space-y-6">
          
          {/* Subcategory Switcher */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
            {[
              { id: 'outfits', label: `Các Bộ Phối Đã Lưu (${visibleSavedOutfits.length})` },
              { id: 'outer', label: 'Cổ Phục Khoác Ngoài (Lớp 3)' },
              { id: 'bottoms', label: 'Quần & Váy (Lớp 2)' },
              { id: 'accessories', label: 'Phụ Kiện Remix (Lớp 4 & 5)' },
              { id: 'fabrics', label: `Hoa Văn & Chất Liệu Trích Xuất (${extractedAssets.length})` }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setRepoCategory(cat.id as any)}
                className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  repoCategory === cat.id
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 1. Saved Complete Outfits Grid with Search & Filters */}
          {repoCategory === 'outfits' && (
            <div className="space-y-5">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên bộ phối, áo khoác, bối cảnh..."
                    className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Garment Family Dropdown Filter */}
                <div className="flex items-center gap-2">
                  <select
                    value={filterFamily}
                    onChange={(e) => setFilterFamily(e.target.value)}
                    className="px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                  >
                    <option value="all">Tất cả kiểu áo</option>
                    <option value="ao_tac">Áo Tấc</option>
                    <option value="ao_nhat_binh">Áo Nhật Bình</option>
                    <option value="ao_ngu_than_chen">Áo Ngũ Thân</option>
                    <option value="ao_tu_than">Áo Tứ Thân</option>
                    <option value="ao_giao_linh">Áo Giao Lĩnh</option>
                  </select>
                </div>
              </div>

              {/* Empty state: When no outfits match search or none exist */}
              {visibleSavedOutfits.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 space-y-3">
                  <FolderArchive className="w-10 h-10 text-stone-400 mx-auto" />
                  <h3 className="font-serif font-bold text-base text-stone-800 dark:text-stone-200">
                    Chưa có bộ trang phục nào trong tủ đồ
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Hãy vào Studio thử nghiệm phối áo tấc, nhật bình, yếm và giày sneaker rồi lưu lại tác phẩm.
                  </p>
                  <button
                    type="button"
                    onClick={() => onLoadOutfitToStudio(selectedOutfit)}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Mở Studio phối đồ ngay</span>
                  </button>
                </div>
              ) : filteredRepositoryOutfits.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Không tìm thấy bộ phối phù hợp với từ khóa "{searchQuery}"
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setFilterFamily('all'); }}
                    className="text-xs text-rose-700 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                  >
                    Đặt lại bộ lọc tìm kiếm
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRepositoryOutfits.map((outfit) => {
                    const isLiked = Boolean(likedOutfitIds[outfit.id]);
                    const currentLikes = outfit.likesCount + (isLiked ? 1 : 0);

                    return (
                      <div
                        key={outfit.id}
                        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md hover:border-amber-400/50 transition-all flex flex-col justify-between"
                      >
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between text-xs text-stone-500">
                            <span>{outfit.createdAt}</span>
                            <span className="font-semibold text-rose-700 dark:text-rose-400">
                              {outfit.etiquetteScore} điểm chuẩn mực
                            </span>
                          </div>

                          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                            {outfit.title}
                          </h3>
                          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2">
                            {outfit.concept}
                          </p>

                          <div className="bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800 text-xs space-y-1">
                            <div className="font-medium text-stone-800 dark:text-stone-200 flex items-center justify-between">
                              <span>{outfit.layers.layer3_outer.name}</span>
                              <span className="text-[10px] text-amber-600 font-bold">Hệ {outfit.fiveElementHarmony.element}</span>
                            </div>
                            <div className="text-[11px] text-stone-500">
                              {outfit.layers.layer2_bottom.name} · {outfit.layers.layer5_modernAccessory.footwearName || 'Giày thể thao'}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-stone-50 dark:bg-stone-950/60 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => onLoadOutfitToStudio(outfit)}
                            className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer min-h-[36px]"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Mở trong Studio</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {/* Optimistic Like Button (<100ms) */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleLike(outfit.id, e)}
                              className={`p-2 min-h-[36px] min-w-[36px] rounded-lg transition-transform active:scale-90 flex items-center gap-1 cursor-pointer ${
                                isLiked ? 'text-rose-600' : 'text-stone-400 hover:text-rose-600'
                              }`}
                              title="Thả tim yêu thích"
                            >
                              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                              <span className="text-xs tabular-nums font-semibold">{currentLikes}</span>
                            </button>

                            {/* Defensive Delete Button (Triggers 6s Undo Toast) */}
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(outfit)}
                              className="text-stone-400 hover:text-red-600 p-2 min-h-[36px] min-w-[36px] rounded-lg transition-colors cursor-pointer"
                              title="Xóa bộ phối này (có thể hoàn tác)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. Extracted Fabrics & Motifs */}
          {repoCategory === 'fabrics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {extractedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm p-4 space-y-3"
                >
                  <div className="h-36 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                      {asset.name}
                    </h4>
                    <span className="text-xs text-stone-500 block">
                      Hoa văn: {asset.detectedPattern}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-xs text-stone-400">Bảng màu:</span>
                    {asset.dominantColors.map((c, i) => (
                      <span key={i} className="w-4 h-4 rounded-full border border-stone-300" style={{ backgroundColor: c }} />
                    ))}
                    <span className="text-xs font-bold text-amber-600 ml-2">Hệ {asset.fiveElement}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Wardrobe Parts: Outer & Bottoms */}
          {(repoCategory === 'outer' || repoCategory === 'bottoms' || repoCategory === 'accessories') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {repoCategory === 'bottoms' && WARDROBE_ITEMS.bottoms.map((b) => (
                <div key={b.id} className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                  <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: b.color }} />
                  <span className="font-semibold text-sm block">{b.name}</span>
                  <span className="text-xs text-stone-500">{b.desc}</span>
                </div>
              ))}

              {repoCategory === 'accessories' && [...WARDROBE_ITEMS.tradAccessories, ...WARDROBE_ITEMS.modernAccessories].map((acc) => (
                <div key={acc.id} className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                  <span className="font-semibold text-sm block">{acc.name}</span>
                  <span className="text-xs text-stone-500">{acc.desc}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* DEFENSIVE UI: 6-SECOND UNDO TOAST FOR DELETED OUTFIT */}
      {pendingDeleteOutfit && (
        <UndoToast
          message={`Đã xóa: ${pendingDeleteOutfit.title}`}
          onUndo={handleConfirmUndo}
          onDismiss={handleFinalizeDelete}
          duration={6000}
        />
      )}

    </div>
  );
};
