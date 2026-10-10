import React, { useState, useRef } from 'react';
import { 
  User, 
  Award, 
  ShieldCheck, 
  QrCode, 
  Sun, 
  Moon, 
  BookOpen, 
  Copy, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Crown,
  HeartHandshake,
  Share2,
  Lock,
  X,
  Camera,
  Upload,
  ArrowRight,
  Download,
  Loader2
} from 'lucide-react';
import { CULTURAL_BADGES } from '../../data/culturalData';
import { CulturalBadge } from '../../types';
import { ActiveTab } from '../Navigation';

interface ProfileCulturalHubScreenProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  heritagePoints: number;
  onAddPoints?: (points: number) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

// Default Traditional Avatar Presets
const AVATAR_PRESETS = [
  { id: 'non_ba_tam', label: 'Nón Ba Tầm', emoji: '👒', color: 'from-amber-700 to-rose-900' },
  { id: 'khan_van', label: 'Khăn Vấn Nhung', emoji: '🧣', color: 'from-rose-800 to-amber-600' },
  { id: 'canh_chuon', label: 'Mũ Cánh Chuồn', emoji: '🪶', color: 'from-blue-900 to-indigo-950' },
  { id: 'nhat_binh', label: 'Nhật Bình Huế', emoji: '👑', color: 'from-purple-900 to-amber-700' }
];

export const ProfileCulturalHubScreen: React.FC<ProfileCulturalHubScreenProps> = ({
  isDarkMode,
  onToggleTheme,
  heritagePoints,
  onAddPoints,
  onNavigateTab
}) => {
  void onAddPoints;

  // User Profile State
  const [userName] = useState<string>('User_Demo');
  const [userSchool] = useState<string>('Trường Đại học Sư phạm Hà nội 2');
  const [userId] = useState<string>('VS001');
  const [isCopiedId, setIsCopiedId] = useState<boolean>(false);

  // Avatar Customization State
  const [avatarPresetId, setAvatarPresetId] = useState<string>(() => {
    try {
      return localStorage.getItem('vpr_avatar_preset') || 'khan_van';
    } catch {
      return 'khan_van';
    }
  });
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('vpr_custom_avatar') || null;
    } catch {
      return null;
    }
  });
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gamification Badges State
  const [badges] = useState<CulturalBadge[]>(CULTURAL_BADGES);

  // Selected Badge for Detail Bottom Sheet Modal
  const [selectedBadge, setSelectedBadge] = useState<CulturalBadge | null>(null);

  // Stylist Digital Pass Modal State
  const [isStylistPassOpen, setIsStylistPassOpen] = useState<boolean>(false);
  const [isExportingPass, setIsExportingPass] = useState<boolean>(false);

  // Global Escape key listener for WCAG 2.2 AA modal accessibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedBadge) setSelectedBadge(null);
        if (isAvatarPickerOpen) setIsAvatarPickerOpen(false);
        if (isStylistPassOpen) setIsStylistPassOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBadge, isAvatarPickerOpen, isStylistPassOpen]);

  // Copy User ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    setIsCopiedId(true);
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  // Upload Custom Avatar File
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        setCustomAvatarUrl(result);
        try {
          localStorage.setItem('vpr_custom_avatar', result);
        } catch {
          // Ignore
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const activePreset = AVATAR_PRESETS.find(p => p.id === avatarPresetId) || AVATAR_PRESETS[1];

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalCount = badges.length;
  const progressPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Export High-Resolution 9:16 Stylist Pass PNG via Canvas
  const handleExportStylistPassPNG = () => {
    setIsExportingPass(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsExportingPass(false);
      return;
    }

    // Rich Imperial Dark Gradient Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, '#1C1917');
    gradient.addColorStop(0.4, '#450A0A');
    gradient.addColorStop(0.8, '#1C1917');
    gradient.addColorStop(1, '#0C0A09');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative Gold Hairline Border
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 6;
    ctx.strokeRect(50, 50, 980, 1820);

    // Header Title
    ctx.fillStyle = '#FAF9F5';
    ctx.font = 'bold 36px Lora, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('VIESKIN · DIGITAL STYLIST PASS', 540, 150);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('THẺ CĂN CƯỚC STYLIST CỔ PHỤC GEN Z', 540, 200);

    // Profile Card Container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(100, 260, 880, 1200, 32);
    ctx.fill();

    // Stylist Avatar Circle / Symbol
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(540, 480, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 80px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(activePreset.emoji, 540, 510);

    // Stylist Name & ID
    ctx.font = 'bold 54px Lora, Georgia, serif';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText(userName, 540, 680);

    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#FAF9F5';
    ctx.fillText(`Stylist ID: ${userId} · ${userSchool}`, 540, 730);

    // Metrics Row
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.beginPath();
    ctx.roundRect(200, 780, 680, 120, 20);
    ctx.fill();

    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText(`${heritagePoints} Điểm Di Sản · ${unlockedCount}/${totalCount} Huy Hiệu`, 540, 850);

    // Top Unlocked Badges Row
    ctx.font = 'bold 28px Lora, Georgia, serif';
    ctx.fillStyle = '#FAF9F5';
    ctx.fillText('Huy Hiệu Danh Giá Đã Sở Hữu', 540, 970);

    const unlockedBadges = badges.filter(b => b.unlocked).slice(0, 3);
    unlockedBadges.forEach((badge, idx) => {
      const xPos = 240 + idx * 300;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(xPos - 110, 1010, 220, 160, 20);
      ctx.fill();

      ctx.font = '40px sans-serif';
      ctx.fillText('👑', xPos, 1070);

      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(badge.title, xPos, 1130);
    });

    // Scannable QR Code Footer
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(100, 1520, 880, 280, 28);
    ctx.fill();

    // QR Code Pixel Representation
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(150, 1560, 200, 200);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(175, 1585, 50, 50);
    ctx.fillRect(275, 1585, 50, 50);
    ctx.fillRect(175, 1685, 50, 50);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 36px Lora, Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('Quét QR kết nối Stylist VieSkin', 390, 1630);

    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`Mã định danh: ${userId} · Chuẩn mực vạt áo`, 390, 1680);
    ctx.fillText('Nền tảng trang phục truyền thống Gen Z', 390, 1720);

    // Download PNG File
    const link = document.createElement('a');
    link.download = `VieSkin_StylistPass_${userId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsExportingPass(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* 1. ACCOUNT MANAGEMENT & PROFILE OVERVIEW */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100 dark:border-stone-800">
          
          <div className="flex items-center gap-4">
            {/* Custom Avatar or Preset Badge */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(true)}
                className="relative cursor-pointer transition-transform group-hover:scale-105 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                title="Thay đổi ảnh đại diện hoặc biểu tượng cổ phục"
                aria-label="Thay đổi ảnh đại diện hoặc biểu tượng cổ phục"
              >
                {customAvatarUrl ? (
                  <img 
                    src={customAvatarUrl} 
                    alt={userName} 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                  />
                ) : (
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${activePreset.color} text-white font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md border-2 border-amber-400/80`}>
                    {activePreset.emoji}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-stone-900 text-amber-300 border border-amber-400 flex items-center justify-center shadow-xs">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  {userName}
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Chuẩn mực vạt áo
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {userSchool}
              </p>
              <div className="flex items-center gap-2 text-xs text-stone-500 pt-0.5">
                <span>Stylist ID: <strong className="text-stone-800 dark:text-stone-200">{userId}</strong></span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer min-h-[44px] min-w-[44px] -m-2 flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  title="Sao chép ID"
                  aria-label="Sao chép ID Stylist"
                >
                  {isCopiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Heritage Level & Quick Metrics */}
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-center min-w-[120px]">
              <span className="text-xs text-stone-500 block">Điểm </span>
              <span className="text-2xl font-bold font-serif text-rose-700 dark:text-rose-400 tabular-nums">
                {heritagePoints}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-center min-w-[120px]">
              <span className="text-xs text-stone-500 block">Huy Hiệu</span>
              <span className="text-2xl font-bold font-serif text-amber-600 dark:text-amber-400 tabular-nums">
                {unlockedCount}/{totalCount}
              </span>
            </div>
          </div>

        </div>

        {/* Preferences & Settings Row */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Theme Preference */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                Chế độ Giao diện
              </span>
              <span className="text-stone-500 text-[11px] block mt-0.5">
                {isDarkMode ? 'Giao diện Cung đình (Tối)' : 'Giao diện Nhã nhặn (Sáng)'}
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700 active:scale-95 transition-all text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5 shrink-0"
              title="Chuyển đổi giao diện Sáng / Tối"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-stone-700" />}
              <span>{isDarkMode ? 'Cung đình (Tối)' : 'Nhã nhặn (Sáng)'}</span>
            </button>
          </div>

          {/* Networking & Digital Stylist Pass */}
          <button
            type="button"
            onClick={() => setIsStylistPassOpen(true)}
            className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-amber-400 flex items-center justify-between text-left transition-colors cursor-pointer group"
          >
            <div>
              <span className="font-semibold text-stone-900 dark:text-stone-100 block group-hover:text-amber-600">
                Thẻ Căn Cước Stylist (Pass 9:16)
              </span>
              <span className="text-stone-500 text-[11px]">
                Xuất thẻ đồ họa Story cá nhân & Mã QR
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
          </button>

          {/* Student Association Tag */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                Hội Nhóm / Câu Lạc Bộ
              </span>
              <span className="text-stone-500 text-[11px]">
                CLB VieSkin
              </span>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </section>

      {/* 2. CULTURAL BADGES & PROGRESS BAR (BADGE GRID) */}
      <section className="bg-white dark:bg-stone-900 p-6 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-5 shadow-sm">
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Huy Hiệu & Thành Tựu Văn Hóa</span>
          </h2>

          {/* Progress Bar View */}
          <div className="space-y-1.5 bg-stone-50 dark:bg-stone-950 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-stone-700 dark:text-stone-300 font-semibold">
                Huy Hiệu Văn Hóa ({unlockedCount}/{totalCount} đã mở)
              </span>
              <span className="text-amber-700 dark:text-amber-400 font-bold tabular-nums">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-200/80 dark:border-stone-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-400 rounded-full transition-all duration-500 shadow-xs" 
                style={{ width: `${progressPercentage}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Compact Badge Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {badges.map((badge) => (
            <button
              key={badge.id}
              type="button"
              onClick={() => setSelectedBadge(badge)}
              className={`group p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 min-h-[105px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-95 ${
                badge.unlocked
                  ? 'bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/30 dark:to-stone-900 border-amber-300 dark:border-amber-700/80 shadow-sm hover:shadow-md hover:border-amber-400'
                  : 'bg-stone-50/80 dark:bg-stone-950/60 border-stone-200/80 dark:border-stone-800 hover:border-stone-300 grayscale opacity-65'
              }`}
            >
              {/* Badge Icon Box */}
              <div className="relative">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-300/60'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 border border-stone-300/60 dark:border-stone-700'
                }`}>
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Status Indicator Icon */}
                <div className="absolute -top-1 -right-1">
                  {badge.unlocked ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-stone-700 text-stone-300 flex items-center justify-center shadow-xs">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Short Title */}
              <span className={`text-[11px] font-medium leading-tight line-clamp-2 ${
                badge.unlocked
                  ? 'text-stone-900 dark:text-stone-100 font-bold'
                  : 'text-stone-500 dark:text-stone-400'
              }`}>
                {badge.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* AVATAR SELECTION MODAL */}
      {isAvatarPickerOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-3 pb-20 sm:p-4 animate-fadeIn"
          onClick={() => setIsAvatarPickerOpen(false)}
        >
          <div 
            className="w-full max-w-sm sm:max-w-md mx-auto bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-5 shadow-2xl animate-slideUp relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Chọn Ảnh Đại Diện Stylist
              </h3>
              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Đóng bảng chọn ảnh đại diện"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Upload Button */}
            <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-center space-y-2">
              <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">Tải ảnh đại diện từ thiết bị</p>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[44px] px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <Upload className="w-4 h-4" />
                <span>Chọn tệp ảnh...</span>
              </button>
            </div>

            {/* Traditional Avatar Presets Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Hoặc chọn biểu tượng cổ phục:</span>
              <div className="grid grid-cols-2 gap-2.5">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAvatarPresetId(preset.id);
                      setCustomAvatarUrl(null);
                      try {
                        localStorage.setItem('vpr_avatar_preset', preset.id);
                        localStorage.removeItem('vpr_custom_avatar');
                      } catch {
                        // Ignore
                      }
                      setIsAvatarPickerOpen(false);
                    }}
                    className={`min-h-[44px] p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      !customAvatarUrl && avatarPresetId === preset.id
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-1 ring-amber-500 font-bold'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-2xl">{preset.emoji}</span>
                    <span className="text-xs text-stone-800 dark:text-stone-200">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL STYLIST PASS 9:16 MODAL */}
      {isStylistPassOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setIsStylistPassOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-stone-950 rounded-3xl border-2 border-amber-400/60 p-6 space-y-5 shadow-2xl animate-slideUp relative flex flex-col justify-between text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsStylistPassOpen(false)}
              className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-stone-800/80 text-stone-300 hover:text-white cursor-pointer z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Đóng thẻ Stylist Pass"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pass Top Card */}
            <div className="text-center space-y-1 pt-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                VIESKIN · DIGITAL STYLIST PASS
              </span>
              <h3 className="font-serif font-bold text-xl text-white">Thẻ Stylist Cổ Phục</h3>
            </div>

            {/* Stylist Avatar & Identity */}
            <div className="bg-stone-900/90 p-5 rounded-2xl border border-amber-500/30 text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl mx-auto overflow-hidden bg-gradient-to-tr from-amber-700 to-rose-900 flex items-center justify-center text-4xl shadow-md border-2 border-amber-400">
                {customAvatarUrl ? (
                  <img src={customAvatarUrl} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  activePreset.emoji
                )}
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-amber-300">{userName}</h4>
                <p className="text-xs text-stone-300">{userSchool}</p>
                <p className="text-[11px] text-amber-400/90 font-medium mt-1">ID: {userId} · Chuẩn mực vạt áo</p>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center justify-around text-xs">
                <div>
                  <span className="text-stone-400 text-[10px] block">Điểm di sản</span>
                  <strong className="text-amber-400 font-serif text-base">{heritagePoints}đ</strong>
                </div>
                <div className="w-px h-6 bg-stone-800" />
                <div>
                  <span className="text-stone-400 text-[10px] block">Huy hiệu</span>
                  <strong className="text-emerald-400 font-serif text-base">{unlockedCount}/{totalCount}</strong>
                </div>
              </div>
            </div>

            {/* Scannable QR Code */}
            <div className="bg-white p-3.5 rounded-2xl flex items-center gap-3 text-stone-950">
              <QrCode className="w-12 h-12 shrink-0 text-stone-900" />
              <div className="space-y-0.5 min-w-0">
                <span className="font-serif font-bold text-xs block truncate">Mã QR Stylist VieSkin</span>
                <span className="text-[10px] text-stone-600 block">Quét để kết nối & xem Lookbook</span>
              </div>
            </div>

            {/* Download CTA */}
            <button
              type="button"
              onClick={handleExportStylistPassPNG}
              disabled={isExportingPass}
              className="min-h-[44px] w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-700 to-amber-600 hover:from-amber-600 hover:to-rose-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {isExportingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isExportingPass ? 'Đang xuất thẻ PNG...' : 'Tải Thẻ Stylist Pass (PNG 9:16)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM SHEET DETAIL MODAL WHEN BADGE IS SELECTED */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 animate-fadeIn"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}
            className="w-full max-w-lg sm:max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl border border-stone-200/90 dark:border-stone-800 p-6 space-y-4 shadow-2xl animate-slideUp relative shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle for Mobile */}
            <div className="w-12 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto sm:hidden -mt-2 mb-2" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  selectedBadge.unlocked
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-md ring-2 ring-amber-300/60'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400'
                }`}>
                  <Crown className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 truncate">
                    {selectedBadge.title}
                  </h3>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block truncate">
                    {selectedBadge.subtitle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="min-h-[44px] min-w-[44px] rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 cursor-pointer shrink-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Đóng chi tiết"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description & Requirements */}
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
              {selectedBadge.description}
            </p>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 dark:border-stone-800">
              <span className="text-stone-500">Trạng thái:</span>
              {selectedBadge.unlocked ? (
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã mở khóa ({selectedBadge.unlockedAt || 'Hôm nay'})</span>
                </span>
              ) : (
                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Cần {selectedBadge.requiredPoints} điểm di sản</span>
                </span>
              )}
            </div>

            {/* DEEP LINKING CTA BUTTON IF BADGE IS LOCKED */}
            {!selectedBadge.unlocked ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedBadge(null);
                  onNavigateTab?.('studio');
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-700 via-rose-800 to-amber-600 hover:from-rose-800 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Đến Studio Phối Đồ Ngay</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. HERITAGE ATTRIBUTION & COPYRIGHT */}
      <section className="border-t border-stone-200 dark:border-stone-800 pt-8 space-y-4 text-xs text-stone-600 dark:text-stone-400">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-base">
          <HeartHandshake className="w-5 h-5 text-rose-700" />
          <span>Nguồn do AI Studio vẽ lại và chỉ sử dụng để DEMO sản phẩm</span>
        </div>

        <div className="pt-3 text-[11px] text-stone-500 border-t border-stone-100 dark:border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            Tài sản mã nguồn mở phục vụ mục đích giáo dục, tôn vinh và sáng tạo văn hóa phi thương mại cho học sinh, sinh viên Việt Nam.
          </span>
          <span className="shrink-0">
            © 2026 VieSkin · Open Cultural Creative Commons (CC BY-NC 4.0)
          </span>
        </div>
      </section>

    </div>
  );
};
