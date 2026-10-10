import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Compass, 
  BookOpen, 
  Sparkles, 
  Upload, 
  ExternalLink, 
  Heart, 
  ShieldCheck, 
  ArrowRight,
  Info,
  X,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  Shirt,
  FolderPlus,
  BookmarkCheck,
  Loader2
} from 'lucide-react';
import { 
  GARMENTS_LORE, 
  TRENDING_REMIXES, 
  CURATED_FABRICS 
} from '../../data/culturalData';
import { 
  GarmentLore, 
  GarmentFamily, 
  OccasionContext, 
  GeographicRegion, 
  TrendingRemixItem, 
  ExtractedAsset,
  GarmentLayerState
} from '../../types';
import heritageBannerImg from '../../assets/images/heritage_banner_1791568159133.jpg';

interface CulturalDiscoveryScreenProps {
  onSelectForRemix: (family: GarmentFamily, preset?: Partial<GarmentLayerState>) => void;
  onApplyExtractedAsset?: (asset: ExtractedAsset) => void;
  onSaveExtractedAsset?: (asset: ExtractedAsset) => void;
}

export const CulturalDiscoveryScreen: React.FC<CulturalDiscoveryScreenProps> = ({
  onSelectForRemix,
  onApplyExtractedAsset,
  onSaveExtractedAsset
}) => {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // Detail Modal State
  const [selectedLore, setSelectedLore] = useState<GarmentLore | null>(null);

  // Esc key dismiss for Lore Modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLore) {
        setSelectedLore(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLore]);

  // Handle Reset All Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFamily('all');
    setSelectedOccasion('all');
    setSelectedRegion('all');
  };

  // Asset Extractor State & Unmount Safe Timers
  const [uploadType, setUploadType] = useState<'pattern' | 'garment'>('pattern');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedAssetResult, setExtractedAssetResult] = useState<ExtractedAsset | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionProgress, setExtractionProgress] = useState<number>(0);
  const [extractionStepText, setExtractionStepText] = useState<string>('');
  const [extractedSuccess, setExtractedSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [savedToLibrary, setSavedToLibrary] = useState<boolean>(false);

  const extractionTimersRef = React.useRef<NodeJS.Timeout[]>([]);

  // Cleanup pending extraction timers on unmount
  React.useEffect(() => {
    return () => {
      extractionTimersRef.current.forEach(t => clearTimeout(t));
      extractionTimersRef.current = [];
    };
  }, []);

  // Trending Likes State
  const [trendingList, setTrendingList] = useState<TrendingRemixItem[]>(TRENDING_REMIXES);

  // Handle Like
  const handleLike = (id: string) => {
    setTrendingList(prev => prev.map(item => 
      item.id === id ? { ...item, likes: item.likes + 1 } : item
    ));
  };

  // Discovery View Mode Switcher
  const [discoveryMode, setDiscoveryMode] = useState<'all' | 'lore' | 'trending'>('all');

  // Filtered Garment Lore
  const filteredGarments = useMemo(() => {
    return GARMENTS_LORE.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.historicalContext.toLowerCase().includes(searchQuery.toLowerCase());

      const matchFamily = selectedFamily === 'all' || item.family === selectedFamily;
      const matchOccasion = selectedOccasion === 'all' || item.suitableOccasions.includes(selectedOccasion as OccasionContext);
      const matchRegion = selectedRegion === 'all' || item.region === selectedRegion || item.region === 'all';

      return matchSearch && matchFamily && matchOccasion && matchRegion;
    });
  }, [searchQuery, selectedFamily, selectedOccasion, selectedRegion]);

  // Filtered Trending Remixes synced with search and family filters
  const filteredTrending = useMemo(() => {
    return trendingList.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.garmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchFamily = selectedFamily === 'all' || item.preset.family === selectedFamily;

      return matchSearch && matchFamily;
    });
  }, [searchQuery, selectedFamily, trendingList]);

  // Handle Image Upload for 2D Asset Extraction
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setSavedToLibrary(false);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Tập tin không hợp lệ. Vui lòng tải lên ảnh có định dạng PNG, JPG, hoặc WEBP.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Ảnh vượt quá giới hạn 10MB. Vui lòng chọn ảnh dung lượng nhẹ hơn để tối ưu tốc độ xử lý.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImage(result);
        processAssetExtraction(result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulated AI background removal and 2D flat asset conversion with multi-stage progress
  const processAssetExtraction = (imgSrc: string, name: string) => {
    // Clear any previous running extraction timers
    extractionTimersRef.current.forEach(t => clearTimeout(t));
    extractionTimersRef.current = [];

    setIsExtracting(true);
    setExtractedSuccess(false);
    setExtractionProgress(10);
    setExtractionStepText('Đang nhận diện hoa văn & phom dáng...');

    const timer1 = setTimeout(() => {
      setExtractionProgress(50);
      setExtractionStepText('Đang bóc tách nền & cân chỉnh góc chụp 2D...');
    }, 600);

    const timer2 = setTimeout(() => {
      setExtractionProgress(85);
      setExtractionStepText('Đang vector hóa & trích xuất bảng màu Ngũ Hành...');
    }, 1200);

    const timer3 = setTimeout(() => {
      setExtractionProgress(100);
      const isGarment = uploadType === 'garment';
      const cleanName = name.replace(/\.[^/.]+$/, '').slice(0, 28) || (isGarment ? 'Y phục 2D bóc tách' : 'Hoa văn gấm bóc tách');
      
      const newAsset: ExtractedAsset = {
        id: `extracted_${Date.now()}`,
        name: cleanName,
        sourceType: 'uploaded',
        imageUrl: imgSrc,
        dominantColors: isGarment ? ['#991B1B', '#D97706', '#1E293B'] : ['#B91C1C', '#D97706', '#FAF9F5'],
        fiveElement: isGarment ? 'Hỏa' : 'Thổ',
        detectedPattern: isGarment ? 'Áo tấc / Ngũ thân đã bóc tách nền 2D chuẩn mannequin' : 'Mô típ hoa văn dệt chìm & mạng kim tuyến',
        category: isGarment ? 'garment' : 'fabric',
        createdAt: new Date().toISOString()
      };
      setExtractedAssetResult(newAsset);
      setIsExtracting(false);
      setExtractedSuccess(true);
    }, 1800);

    extractionTimersRef.current.push(timer1, timer2, timer3);
  };

  // Select Curated Fabric
  const selectCuratedFabric = (fabric: ExtractedAsset) => {
    setUploadedImage(fabric.imageUrl);
    setExtractedAssetResult(fabric);
    setExtractedSuccess(true);
    setSavedToLibrary(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-12">
      
      {/* HERO SECTION WITH HERITAGE BANNER & GOLDEN-YELLOW SERIF TYPOGRAPHY */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-900/40 shadow-xl bg-stone-950">
        {/* Background Image & Rich Imperial Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={heritageBannerImg}
            alt="Di sản Cổ Phục Việt Nam - Áo Tấc, Nhật Bình, Ngũ Thân"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
          />
          {/* Deep imperial gradient overlays: crimson to dark charcoal */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-stone-950/90" />
          <div className="absolute inset-0 bg-radial from-amber-950/20 via-transparent to-stone-950/60 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 px-4 py-8 sm:px-10 sm:py-16 md:py-20 max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          {/* Main Title: Bold Serif, Golden-Yellow Gradient with Balanced Text Wrap */}
          <h1 className="font-serif font-bold text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight select-none [text-wrap:balance]">
            <span className="block text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Di Sản & Điển Tích
            </span>
            <span className="bg-gradient-to-r from-[#FFF5C0] via-[#FFD700] to-[#E5A823] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
              VieSkin
            </span>
          </h1>

          {/* Subtitle with seamless, natural words */}
          <p className="max-w-2xl mx-auto text-xs sm:text-base text-stone-300 font-sans leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] [text-wrap:balance]">
            Khám phá quy chuẩn <strong className="font-medium text-amber-200">Áo Tấc</strong>, <strong className="font-medium text-amber-200">Áo Nhật Bình</strong>, <strong className="font-medium text-amber-200">Ngũ Thân</strong> truyền thống. 
            Tự tin <strong className="font-medium text-amber-200">phối đồ</strong> giao thoa phong cách streetwear, dạo phố và <strong className="font-medium text-amber-200">dạ tiệc tối</strong> chuẩn mực ngũ hành.
          </p>

          {/* Quick Metrics Bar - Responsive Badges */}
          <div className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-[11px] sm:text-xs text-stone-300/90 font-medium">
            <span className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:p-0 rounded-lg bg-white/5 sm:bg-transparent border border-white/10 sm:border-none">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span>100% Chuẩn Hữu Nhiệm</span>
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:p-0 rounded-lg bg-white/5 sm:bg-transparent border border-white/10 sm:border-none">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span>Ngũ Hành Tương Sinh</span>
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:p-0 rounded-lg bg-white/5 sm:bg-transparent border border-white/10 sm:border-none">
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span>Remix Sáng Tạo Gen Z</span>
            </span>
          </div>
        </div>
      </section>

      {/* MULTI-DIMENSIONAL SEARCH & FILTER BAR */}
      <section className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
        
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên y phục, điển tích, hoa văn (VD: Áo Tấc, Nhật Bình, Thủy Ba, Minh Mạng...)"
            className="w-full h-12 pl-11 pr-10 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-rose-600 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 leading-normal transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* 1. Dòng y phục / Kiểu dáng */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Dòng y phục / Kiểu dáng
            </label>
            <div className="relative">
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="w-full h-10 px-3.5 pr-8 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-medium text-stone-900 dark:text-stone-100 leading-normal focus:outline-none focus:ring-2 focus:ring-rose-600 cursor-pointer appearance-none transition-all"
              >
                <option value="all" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Tất cả kiểu dáng</option>
                <option value="ao_tac" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Áo Tấc (Ngũ Thân Tay Thụng)</option>
                <option value="ao_nhat_binh" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Áo Nhật Bình (Triều đình Huế)</option>
                <option value="ao_ngu_than_chen" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Áo Ngũ Thân Tay Chẽn</option>
                <option value="ao_tu_than" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Áo Tứ Thân (Bắc Bộ Dân Gian)</option>
                <option value="ao_giao_linh" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Áo Giao Lĩnh (Lý - Trần - Lê)</option>
                <option value="ao_dai" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Áo Dài Tân Thời / Cách Tân</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. Bối cảnh / Dịp sự kiện */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Bối cảnh / Mục đích mặc
            </label>
            <div className="relative">
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="w-full h-10 px-3.5 pr-8 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-medium text-stone-900 dark:text-stone-100 leading-normal focus:outline-none focus:ring-2 focus:ring-rose-600 cursor-pointer appearance-none transition-all"
              >
                <option value="all" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Mọi bối cảnh sự kiện</option>
                <option value="yearbook_graduation" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Chụp kỷ yếu / Tốt nghiệp sinh viên</option>
                <option value="streetwear_cafe" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Dạo phố cà phê / Streetwear Gen Z</option>
                <option value="gala_formal" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Dạ tiệc trang trọng / Gala quốc tế</option>
                <option value="lunar_new_year" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Tết Nguyên Đán & Lễ xuân</option>
                <option value="folk_festival" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Lễ hội dân gian truyền thống</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* 3. Vùng địa lý */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Vùng miền văn hóa
            </label>
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full h-10 px-3.5 pr-8 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-medium text-stone-900 dark:text-stone-100 leading-normal focus:outline-none focus:ring-2 focus:ring-rose-600 cursor-pointer appearance-none transition-all"
              >
                <option value="all" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Toàn quốc (Bắc - Trung - Nam)</option>
                <option value="north" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Bắc Bộ (Đồng bằng & Kinh Bắc)</option>
                <option value="central" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Trung Bộ (Cố đô Huế & Miền Trung)</option>
                <option value="south" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">Nam Bộ (Sài Gòn & Lục Tỉnh)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Result Counter */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500">
          <span>Tìm thấy {filteredGarments.length} loại y phục truyền thống tiêu biểu</span>
          {(selectedFamily !== 'all' || selectedOccasion !== 'all' || selectedRegion !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedFamily('all');
                setSelectedOccasion('all');
                setSelectedRegion('all');
                setSearchQuery('');
              }}
              className="text-rose-700 dark:text-rose-400 font-medium hover:underline cursor-pointer"
            >
              Đặt lại
            </button>
          )}
        </div>
      </section>

      {/* INTEGRATED HERITAGE LORE & TRENDING REMIXES SECTION */}
      <section className="space-y-6">
        {/* Section Title & View Switcher Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tìm hiểu và Kết nối</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Khám phá
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Tra cứu quy chuẩn lễ nghi di sản cùng các bản phối cách tânGen Z thịnh hành nhất
            </p>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setDiscoveryMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                discoveryMode === 'all'
                  ? 'bg-rose-700 text-white shadow-sm font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tất Cả </span>
            </button>
            <button
              type="button"
              onClick={() => setDiscoveryMode('lore')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                discoveryMode === 'lore'
                  ? 'bg-rose-700 text-white shadow-sm font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Thư viện ({filteredGarments.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setDiscoveryMode('trending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                discoveryMode === 'trending'
                  ? 'bg-rose-700 text-white shadow-sm font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Xu Hướng ({filteredTrending.length})</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredGarments.length === 0 && filteredTrending.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <BookOpen className="w-10 h-10 text-stone-400 mx-auto" />
            <div>
              <h3 className="font-serif font-semibold text-stone-800 dark:text-stone-200 text-base">
                Không tìm thấy
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                Không có kết quả khớp với từ khóa tìm kiếm. Hãy thử chọn điều kiện lọc khác.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 min-h-[40px] rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              Đặt lại
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* LORE SECTION (Shown in 'all' or 'lore' mode) */}
            {(discoveryMode === 'all' || discoveryMode === 'lore') && filteredGarments.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                    <span>Thư Viện Điển Tích Cổ Phục ({filteredGarments.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGarments.map((garment) => {
                    const relatedRemixCount = trendingList.filter(r => r.preset.family === garment.family).length;

                    return (
                      <div
                        key={garment.id}
                        onClick={() => setSelectedLore(garment)}
                        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md hover:border-amber-400/60 dark:hover:border-amber-600/60 transition-all cursor-pointer flex flex-col group relative"
                      >
                        {/* Visual Header / Color Banner */}
                        <div 
                          className="h-32 p-4 flex flex-col justify-between relative overflow-hidden"
                          style={{ backgroundColor: garment.defaultColors.robe }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                          
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                              {garment.era.split('(')[0].trim()}
                            </span>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/40 text-amber-300 border border-amber-300/30">
                              Hành {garment.fiveElement}
                            </span>
                          </div>

                          <div className="relative z-10">
                            <h3 className="text-lg font-serif font-bold text-white group-hover:text-amber-200 transition-colors">
                              {garment.name}
                            </h3>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                            {garment.description}
                          </p>

                          <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                            {/* Connected Trending Remixes Counter Badge */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-stone-500 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{garment.etiquetteRules.length} quy tắc lễ nghi</span>
                              </span>
                              {relatedRemixCount > 0 && (
                                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span>{relatedRemixCount} Xu hướng Remix</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLore(garment);
                                }}
                                className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Xem điển tích</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectForRemix(garment.family);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                              >
                                <span>Phối đồ</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TRENDING REMIX FEED SECTION (Shown in 'all' or 'trending' mode) */}
            {(discoveryMode === 'all' || discoveryMode === 'trending') && filteredTrending.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                    <span>Xu Hướng Phối Đồ VieSkin Gen Z ({filteredTrending.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTrending.map((remix) => {
                    const loreMatch = GARMENTS_LORE.find(g => g.family === remix.preset.family);

                    return (
                      <div
                        key={remix.id}
                        className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4 hover:border-rose-300 dark:hover:border-rose-900/60 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Author Info & Cross-Link Badge to Heritage Lore */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold flex items-center justify-center">
                                {remix.avatar}
                              </div>
                              <div>
                                <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                                  {remix.author}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleLike(remix.id)}
                              className="flex items-center gap-1 text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Heart className="w-4 h-4 fill-rose-100 text-rose-600" />
                              <span className="font-semibold text-xs tabular-nums">{remix.likes}</span>
                            </button>
                          </div>

                          {/* Link to Historical Lore Origin */}
                          {loreMatch && (
                            <button
                              type="button"
                              onClick={() => setSelectedLore(loreMatch)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 transition-colors cursor-pointer"
                            >
                              <BookOpen className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Gốc di sản: {loreMatch.name} ({loreMatch.era.split('(')[0].trim()})</span>
                            </button>
                          )}

                          {/* Title & Description */}
                          <div>
                            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                              {remix.title}
                            </h3>
                            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
                              {remix.description}
                            </p>
                          </div>

                          {/* Modern Pairing Highlights */}
                          <div className="bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-100 dark:border-stone-800 space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                              <span className="font-semibold">Cổ phục:</span>
                              <span>{remix.garmentName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                              <span className="font-semibold">Phụ kiện Gen Z:</span>
                              <span>{remix.modernItems.join(' · ')}</span>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="text-xs text-stone-500 dark:text-stone-400">
                            {remix.tags.join(' / ')}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => onSelectForRemix(remix.preset.family, {
                              layer3_outer: {
                                id: remix.preset.family,
                                name: remix.garmentName,
                                family: remix.preset.family,
                                robeColor: remix.preset.robeColor,
                                collarColor: remix.preset.collarColor,
                                trimColor: '#D97706',
                                patternType: 'thuy_ba',
                                lapelDirection: 'right_over_left'
                              },
                              layer1_inner: {
                                id: 'yem_inner',
                                name: 'Yếm phối',
                                color: remix.preset.innerColor,
                                visible: true
                              },
                              layer2_bottom: {
                                id: 'bottom_preset',
                                name: 'Quần/Váy phối',
                                color: remix.preset.bottomColor,
                                type: 'trousers'
                              },
                              layer4_tradAccessory: {
                                headwearId: remix.preset.tradHead,
                                headwearName: 'Khăn Vấn'
                              },
                              layer5_modernAccessory: {
                                footwearId: remix.preset.modFoot,
                                eyewearId: remix.preset.modEye,
                                bagId: remix.preset.modBag
                              }
                            })}
                            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Compass className="w-4 h-4" />
                            <span>Remix Ngay Bộ Phối Này Trong Studio</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* LORE DETAIL MODAL */}
      {selectedLore && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-lore-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLore(null);
          }}
        >
          <div className="bg-white dark:bg-stone-900 max-w-2xl w-full rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-rose-800 dark:text-rose-400 font-semibold mb-1">
                  {selectedLore.era} · Hệ {selectedLore.fiveElement}
                </div>
                <h3 id="modal-lore-title" className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  {selectedLore.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLore(null)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Historical Context */}
              <div>
                <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-rose-700" />
                  Bối cảnh lịch sử & Nguồn gốc
                </h4>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  {selectedLore.historicalContext}
                </p>
              </div>

              {/* Founding Etiquette Rules */}
              <div>
                <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Quy chuẩn mặc nền tảng (Etiquette)
                </h4>
                <ul className="space-y-2 text-stone-600 dark:text-stone-300 list-disc list-inside">
                  {selectedLore.etiquetteRules.map((rule, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pattern Symbolism */}
              <div>
                <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Biểu tượng hoa văn & Ý nghĩa
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600 dark:text-stone-300">
                  {selectedLore.patternSymbolism.map((sym, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs">
                      {sym}
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Trending Remixes in Modal */}
              {(() => {
                const modalRemixes = trendingList.filter(r => r.preset.family === selectedLore.family);
                if (modalRemixes.length === 0) return null;

                return (
                  <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
                    <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Xu Hướng Phối Đồ Remix Của {selectedLore.name} ({modalRemixes.length})</span>
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {modalRemixes.map(remix => (
                        <div key={remix.id} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-2 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-stone-900 dark:text-stone-100">{remix.title}</span>
                              <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                                <Heart className="w-3 h-3 fill-rose-500" /> {remix.likes}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">{remix.description}</p>
                            <div className="text-[10px] text-stone-500 pt-1">
                              <strong>Phụ kiện:</strong> {remix.modernItems.join(', ')}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLore(null);
                              onSelectForRemix(remix.preset.family, {
                                layer3_outer: {
                                  id: remix.preset.family,
                                  name: remix.garmentName,
                                  family: remix.preset.family,
                                  robeColor: remix.preset.robeColor,
                                  collarColor: remix.preset.collarColor,
                                  trimColor: '#D97706',
                                  patternType: 'thuy_ba',
                                  lapelDirection: 'right_over_left'
                                },
                                layer1_inner: {
                                  id: 'yem_inner',
                                  name: 'Yếm phối',
                                  color: remix.preset.innerColor,
                                  visible: true
                                },
                                layer2_bottom: {
                                  id: 'bottom_preset',
                                  name: 'Quần/Váy phối',
                                  color: remix.preset.bottomColor,
                                  type: 'trousers'
                                },
                                layer4_tradAccessory: {
                                  headwearId: remix.preset.tradHead,
                                  headwearName: 'Khăn Vấn'
                                },
                                layer5_modernAccessory: {
                                  footwearId: remix.preset.modFoot,
                                  eyewearId: remix.preset.modEye,
                                  bagId: remix.preset.modBag
                                }
                              });
                            }}
                            className="w-full py-1.5 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-[11px] font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Ướm Thử Trong Studio</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedLore(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  const fam = selectedLore.family;
                  setSelectedLore(null);
                  onSelectForRemix(fam);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-700 hover:bg-rose-800 text-white cursor-pointer flex items-center gap-1.5"
              >
                <span>Đưa vào Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI 2D STYLIZER & ASSET EXTRACTOR SECTION */}
      <section className="bg-gradient-to-br from-stone-900 to-stone-950 text-stone-100 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 2D Stylizer & Asset Extractor</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
            Trích Xuất Hoa Văn & Chuẩn Hóa Vector 2D
          </h2>
          <p className="text-sm text-stone-300 leading-relaxed">
            Tải lên ảnh chụp thực tế vải gấm, lụa hoặc trang phục cổ phong. Trí tuệ nhân tạo sẽ tự động tách nền, cân chỉnh góc nhìn và chuyển đổi thành tài sản vector 2D chuẩn hóa để đưa lên Mannequin phối đồ.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Upload Area & Mode Categorization Tabs */}
          <div className="space-y-4">
            
            {/* Upload Intent Categorization Segmented Control */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-stone-300 block">
                Phân loại tài nguyên tải lên (Upload Intent):
              </span>
              <div className="grid grid-cols-2 gap-2 bg-stone-950 p-1.5 rounded-xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => setUploadType('pattern')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    uploadType === 'pattern'
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Họa tiết / Chất liệu vải</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('garment')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    uploadType === 'garment'
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <Shirt className="w-4 h-4" />
                  <span>Trang phục nguyên bộ</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-300/80 italic px-1">
                {uploadType === 'pattern'
                  ? '• Chế độ Họa tiết: AI trích xuất pattern dệt chìm và tự động áp dụng bảng màu Ngũ Hành lên áo.'
                  : '• Chế độ Y phục: AI tự động bóc tách nền, xoay cân bằng góc chụp và tạo layer 2D vừa phom Mannequin.'}
              </p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div className="border-2 border-dashed border-stone-700 hover:border-amber-400/80 rounded-2xl p-6 text-center transition-colors bg-stone-950/40 group">
              <input
                type="file"
                id="fabric-upload-input"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="fabric-upload-input"
                className="flex flex-col items-center justify-center cursor-pointer space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-stone-800 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">
                    {uploadType === 'pattern'
                      ? 'Tải ảnh chụp vải gấm, lụa hoặc hoa văn cổ'
                      : 'Tải ảnh chụp trang phục cổ phong nguyên bộ'}
                  </span>
                  <span className="text-xs text-stone-400">
                    Hỗ trợ PNG, JPG, WEBP (Tối đa 10MB)
                  </span>
                </div>
              </label>
            </div>

            {/* Upload Error Feedback */}
            {uploadError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200">
                {uploadError}
              </div>
            )}

            {/* Curated Artisanal Fabric Samples */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-400 block">
                Hoặc chọn hoa văn mẫu từ làng nghề truyền thống:
              </span>
              <div className="grid grid-cols-3 gap-3">
                {CURATED_FABRICS.map((fabric) => (
                  <button
                    key={fabric.id}
                    type="button"
                    onClick={() => selectCuratedFabric(fabric)}
                    className="p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-left transition-colors cursor-pointer group"
                  >
                    <div className="h-14 rounded-lg overflow-hidden mb-2 bg-stone-900 border border-stone-800">
                      <img src={fabric.imageUrl} alt={fabric.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-xs font-medium text-stone-200 line-clamp-1 block">
                      {fabric.name}
                    </span>
                    <span className="text-[10px] text-amber-400 font-medium block">
                      Hệ {fabric.fiveElement}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Extraction Processing & 2D Vector Preview Column */}
          <div className="bg-stone-950/90 rounded-2xl border border-stone-800 p-5 space-y-4 min-h-[320px] flex flex-col justify-between relative overflow-hidden">
            
            {/* Processing State with Progress Bar & Scanning Animation */}
            {isExtracting ? (
              <div className="my-auto py-8 text-center space-y-5">
                <div className="relative w-20 h-20 mx-auto rounded-xl overflow-hidden border border-amber-500/40 bg-stone-900 flex items-center justify-center">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Scanning" className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                  )}
                  {/* Laser Scanning Line Animation */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-bounce shadow-lg shadow-amber-400/50" />
                </div>

                <div className="space-y-2 max-w-xs mx-auto">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-amber-300 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{extractionStepText}</span>
                    </span>
                    <span className="text-amber-400 tabular-nums">{extractionProgress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-700">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                      style={{ width: `${extractionProgress}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-stone-400">
                  Thuật toán AI tự động tách lớp alpha, chuẩn hóa góc nhìn 2D và trích xuất ngũ hành.
                </p>
              </div>
            ) : extractedAssetResult ? (
              /* Extraction Result Screen with Dual CTAs */
              <div className="space-y-4 my-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">
                      Đã Bóc Tách Vector 2D Thành Công
                    </span>
                  </div>
                  <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-md border border-stone-700">
                    {extractedAssetResult.category === 'garment' ? 'Y Phục 2D' : 'Họa Tiết Canvas'}
                  </span>
                </div>

                {/* Extracted Asset Info Card */}
                <div className="flex items-center gap-4 bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-inner">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 bg-stone-950 p-1">
                    <img
                      src={extractedAssetResult.imageUrl}
                      alt="Extracted Preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-white block text-sm">
                      {extractedAssetResult.name}
                    </span>
                    <p className="text-stone-300 line-clamp-2 leading-relaxed text-[11px]">
                      {extractedAssetResult.detectedPattern}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-stone-400 text-[10px]">Ngũ Hành:</span>
                      <span className="text-amber-400 font-bold text-[11px]">
                        Hệ {extractedAssetResult.fiveElement}
                      </span>
                      <div className="flex items-center gap-1 ml-2">
                        {extractedAssetResult.dominantColors.map((c, i) => (
                          <span key={i} className="w-3.5 h-3.5 rounded-full border border-stone-600 shadow-sm" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Feedback Alert */}
                {savedToLibrary && (
                  <div className="p-2.5 bg-emerald-950/90 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Đã lưu tài sản vào Tủ đồ cá nhân & Khung phối đồ Studio!</span>
                  </div>
                )}

                {/* Dual Action CTAs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onApplyExtractedAsset) {
                        onApplyExtractedAsset(extractedAssetResult);
                      }
                      onSelectForRemix('ao_tac');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Áp Dụng Vào Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSaveExtractedAsset) {
                        onSaveExtractedAsset(extractedAssetResult);
                      } else if (onApplyExtractedAsset) {
                        onApplyExtractedAsset(extractedAssetResult);
                      }
                      setSavedToLibrary(true);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-xs border border-stone-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4 text-amber-400" />
                    <span>{savedToLibrary ? 'Đã Lưu Tủ Đồ' : 'Lưu Vào Tủ Đồ'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* BEFORE / AFTER DEMO EMPTY STATE */
              <div className="space-y-4 my-auto p-2">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span>Minh Họa Công Nghệ Bóc Tách (Before / After Demo)</span>
                  </span>
                  <span className="text-[10px] text-stone-500">Xem trước</span>
                </div>

                {/* Visual Before / After Card */}
                <div className="grid grid-cols-2 gap-3 bg-stone-900/80 p-3.5 rounded-xl border border-stone-800/80">
                  {/* BEFORE: Realistic Raw Photo */}
                  <div className="space-y-1.5 text-center">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Ảnh Thực Tế (Before)
                    </span>
                    <div className="h-28 rounded-lg overflow-hidden border border-stone-700 relative group bg-stone-950">
                      <img
                        src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2327272A'/><circle cx='50' cy='50' r='35' fill='%23991B1B'/><path d='M30 30 L70 70 M70 30 L30 70' stroke='%23D97706' stroke-width='4'/></svg>"
                        alt="Demo Before"
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-[10px] text-stone-300 font-medium p-1">
                        Chụp thực tế có nền & vệt sáng
                      </div>
                    </div>
                  </div>

                  {/* AFTER: Vector 2D Asset */}
                  <div className="space-y-1.5 text-center">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Vector 2D (After)
                    </span>
                    <div className="h-28 rounded-lg overflow-hidden border border-amber-500/50 relative bg-stone-950/80 p-2 flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center p-1">
                        <img
                          src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><circle cx='50' cy='50' r='35' fill='%23991B1B'/><path d='M30 30 L70 70 M70 30 L30 70' stroke='%23D97706' stroke-width='4'/></svg>"
                          alt="Demo After"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[9px] text-emerald-400 font-semibold mt-1">
                        Đã tách nền & định dạng 2D
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-400 text-center leading-relaxed">
                  Tải lên ảnh mẫu của bạn ở khung bên trái để AI tự động trích xuất thành tài sản Vector 2D và phối lên Mannequin!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};
