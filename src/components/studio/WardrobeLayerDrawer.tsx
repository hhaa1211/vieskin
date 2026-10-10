import React, { useState } from 'react';
import { 
  Shirt, 
  Layers, 
  Eye, 
  EyeOff, 
  Trash2, 
  GripVertical, 
  User, 
  Check, 
  Plus, 
  Sparkles, 
  ChevronUp, 
  ChevronDown,
  Upload,
  X,
  Palette
} from 'lucide-react';
import { 
  GarmentLayerState, 
  MannequinSettings, 
  DynamicLayerItem, 
  GarmentFamily 
} from '../../types';
import { 
  GARMENTS_LORE, 
  WARDROBE_ITEMS 
} from '../../data/culturalData';

// Vietnamese Cultural Natural Dye Palettes for Fast Ergonomic Coloring
export const HERITAGE_PALETTES = [
  { name: 'Son Chu Sa', hex: '#DC2626', desc: 'Hành Hỏa · Đỏ son cung đình' },
  { name: 'Chàm Thẫm', hex: '#1E3A8A', desc: 'Hành Thủy · Lam chàm tự nhiên' },
  { name: 'Hoàng Kim', hex: '#D97706', desc: 'Hành Thổ · Vàng hoàng gia tôn quý' },
  { name: 'Lục Thủy Ngọc', hex: '#0D9488', desc: 'Hành Mộc · Xanh bích thanh nhã' },
  { name: 'Củ Nâu', hex: '#78350F', desc: 'Hành Thổ · Nâu đất mộc mạc cổ phong' },
  { name: 'Than Mun', hex: '#0F172A', desc: 'Hành Thủy · Đen tuyền trang nghiêm' },
  { name: 'Hồng Sen', hex: '#DB2777', desc: 'Hành Hỏa · Sắc sen cung đình' },
  { name: 'Bạch Tuyết', hex: '#FAF9F5', desc: 'Hành Kim · Lụa tơ tằm nguyên bản' }
];

const SKIN_TONES = [
  { label: 'Sáng hồng', hex: '#FBD5B5' },
  { label: 'Tự nhiên', hex: '#F3C59A' },
  { label: 'Ngăm mật ong', hex: '#DFA372' },
  { label: 'Bánh mật', hex: '#B87B4C' }
];

interface WardrobeLayerDrawerProps {
  currentLayers: GarmentLayerState;
  dynamicLayers: DynamicLayerItem[];
  mannequin: MannequinSettings;
  onUpdateMannequin: (settings: MannequinSettings) => void;
  onEquipItem: (item: any) => void;
  onToggleLayerVisibility: (layerId: string) => void;
  onRemoveLayer: (layerId: string) => void;
  onMoveLayer: (index: number, direction: 'up' | 'down') => void;
  onSelectLayer: (layerId: string | null) => void;
  selectedLayerId: string | null;
  onUpdateOuterColor: (color: string) => void;
}

export const WardrobeLayerDrawer: React.FC<WardrobeLayerDrawerProps> = ({
  currentLayers,
  dynamicLayers,
  mannequin,
  onUpdateMannequin,
  onEquipItem,
  onToggleLayerVisibility,
  onRemoveLayer,
  onMoveLayer,
  onSelectLayer,
  selectedLayerId,
  onUpdateOuterColor
}) => {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'layers'>('wardrobe');
  const [wardrobeCategory, setWardrobeCategory] = useState<'all' | 'outer' | 'inner' | 'bottom' | 'acc'>('all');
  const [isMannequinPopoverOpen, setIsMannequinPopoverOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleHorizontalWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.stopPropagation();
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  // Helper to render crisp 2D vector preview graphic for item thumbnails
  const renderItemVectorThumbnail = (item: any) => {
    const cat = item.category;
    const color = item.color || '#D97706';
    const id = (item.id || '').toLowerCase();

    if (cat === 'outer') {
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10 shrink-0 drop-shadow-sm">
          {/* Mini Robe Vector */}
          <path d="M 20,6 L 10,12 L 14,34 L 26,34 L 30,12 Z" fill={color} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <path d="M 20,6 L 14,18 L 26,18 Z" fill="#FAF9F5" opacity="0.8" />
          <line x1="20" y1="6" x2="20" y2="34" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          <line x1="14" y1="34" x2="26" y2="34" stroke="#D97706" strokeWidth="1.5" />
        </svg>
      );
    } else if (cat === 'inner') {
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10 shrink-0 drop-shadow-sm">
          {/* Mini Yếm Vector */}
          <path d="M 14,8 Q 20,13 26,8 L 30,28 L 10,28 Z" fill={color} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <path d="M 14,8 Q 20,2 26,8" stroke="#FAF9F5" strokeWidth="1.2" fill="none" />
          <line x1="10" y1="28" x2="30" y2="28" stroke="#FAF9F5" strokeWidth="1" />
        </svg>
      );
    } else if (cat === 'bottom') {
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10 shrink-0 drop-shadow-sm">
          {/* Mini Trousers / Skirt Vector */}
          <path d="M 12,8 L 28,8 L 32,34 L 21,34 L 20,18 L 19,34 L 8,34 Z" fill={color} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="12" y1="8" x2="28" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
        </svg>
      );
    } else if (id.includes('khan_van') || id.includes('headwear')) {
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10 shrink-0 drop-shadow-sm">
          {/* Mini Turban Vector */}
          <path d="M 6,18 Q 20,10 34,18 Q 38,26 30,30 Q 20,22 10,30 Q 2,26 6,18 Z" fill={color} stroke="#D4AF37" strokeWidth="1" />
          <path d="M 10,21 Q 20,15 30,21" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" fill="none" />
        </svg>
      );
    } else if (id.includes('non')) {
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10 shrink-0 drop-shadow-sm">
          {/* Mini Nón Lá Vector */}
          <polygon points="20,8 4,30 36,30" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" />
          <line x1="12" y1="20" x2="28" y2="20" stroke="#F59E0B" strokeWidth="0.8" />
          <path d="M 10,30 Q 5,36 3,38" stroke="#EC4899" strokeWidth="1.5" />
        </svg>
      );
    } else if (id.includes('kinh')) {
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10 shrink-0 drop-shadow-sm">
          {/* Mini Glasses Vector */}
          <ellipse cx="12" cy="20" rx="8" ry="5" fill="#0F172A" stroke="#D97706" strokeWidth="1.2" />
          <ellipse cx="28" cy="20" rx="8" ry="5" fill="#0F172A" stroke="#D97706" strokeWidth="1.2" />
          <line x1="20" y1="20" x2="20" y2="20" stroke="#D97706" strokeWidth="2" />
          <line x1="4" y1="20" x2="1" y2="18" stroke="#D97706" strokeWidth="1" />
          <line x1="36" y1="20" x2="39" y2="18" stroke="#D97706" strokeWidth="1" />
        </svg>
      );
    } else if (id.includes('tote') || id.includes('tui') || id.includes('bag')) {
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10 shrink-0 drop-shadow-sm">
          {/* Mini Bag Vector */}
          <path d="M 14,14 L 14,8 Q 20,4 26,8 L 26,14" stroke="#78716C" strokeWidth="1.5" fill="none" />
          <rect x="10" y="14" width="20" height="22" rx="3" fill={color} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <path d="M 15,22 Q 20,18 25,22" stroke="#991B1B" strokeWidth="1" fill="none" />
        </svg>
      );
    }

    return (
      <div
        className="w-8 h-8 rounded-lg border border-white/20 shadow-inner shrink-0 flex items-center justify-center font-bold text-[10px] text-white"
        style={{ backgroundColor: color }}
      >
        ✦
      </div>
    );
  };

  // Clean redundant words in titles (e.g., "Mũ/Khăn Quấn Khăn Vấn" -> "Khăn Vấn Nhung", "Quần Quần Ống Suông" -> "Quần Ống Suông")
  const cleanTitle = (rawName: string) => {
    if (!rawName) return '';
    let name = rawName;
    name = name.replace(/Mũ\/Khăn Quấn\s*/gi, '');
    name = name.replace(/Quần Quần/gi, 'Quần');
    name = name.replace(/Khăn Quấn Khăn Vấn/gi, 'Khăn Vấn');
    return name.trim();
  };

  // Compile all wardrobe items for 2-column display
  const wardrobeList = React.useMemo(() => {
    const list: Array<{
      id: string;
      category: 'outer' | 'inner' | 'bottom' | 'acc';
      name: string;
      sub: string;
      color?: string;
      isEquipped: boolean;
      raw: any;
    }> = [];

    // Outer Robes
    GARMENTS_LORE.forEach(g => {
      const cleaned = cleanTitle(g.name.split('(')[0].trim());
      list.push({
        id: g.family,
        category: 'outer',
        name: cleaned,
        sub: g.era.split('(')[0].trim(),
        color: g.defaultColors.robe,
        isEquipped: currentLayers.layer3_outer.family === g.family,
        raw: {
          category: 'outer',
          id: g.family,
          name: cleaned,
          color: g.defaultColors.robe
        }
      });
    });

    // Inner Yếm
    WARDROBE_ITEMS.inners.forEach(i => {
      const cleaned = cleanTitle(i.name);
      list.push({
        id: i.id,
        category: 'inner',
        name: cleaned,
        sub: 'Lớp 1 · Lót trong',
        color: i.color,
        isEquipped: currentLayers.layer1_inner.id === i.id && currentLayers.layer1_inner.visible,
        raw: {
          category: 'inner',
          id: i.id,
          name: cleaned,
          color: i.color
        }
      });
    });

    // Bottoms
    WARDROBE_ITEMS.bottoms.forEach(b => {
      const cleaned = cleanTitle(b.name);
      list.push({
        id: b.id,
        category: 'bottom',
        name: cleaned,
        sub: 'Lớp 2 · Hạ y',
        color: b.color,
        isEquipped: currentLayers.layer2_bottom.id === b.id,
        raw: {
          category: 'bottom',
          id: b.id,
          name: cleaned,
          color: b.color,
          type: b.type
        }
      });
    });

    // Traditional & Modern Accessories
    WARDROBE_ITEMS.tradAccessories.forEach(a => {
      const isEquipped = 
        currentLayers.layer4_tradAccessory.headwearId === a.id ||
        currentLayers.layer4_tradAccessory.jewelryId === a.id;

      const cleaned = cleanTitle(a.name);
      list.push({
        id: a.id,
        category: 'acc',
        name: cleaned,
        sub: 'Cổ phong',
        color: a.color || '#D4AF37',
        isEquipped,
        raw: {
          category: a.category === 'headwear' ? 'trad_head' : a.category === 'jewelry' ? 'trad_jewel' : 'acc',
          id: a.id,
          name: cleaned,
          color: a.color
        }
      });
    });

    WARDROBE_ITEMS.modernAccessories.forEach(m => {
      const isEquipped = 
        currentLayers.layer5_modernAccessory.footwearId === m.id ||
        currentLayers.layer5_modernAccessory.eyewearId === m.id ||
        currentLayers.layer5_modernAccessory.bagId === m.id;

      const cleaned = cleanTitle(m.name);
      list.push({
        id: m.id,
        category: 'acc',
        name: cleaned,
        sub: 'Đương đại',
        color: '#64748B',
        isEquipped,
        raw: {
          category: m.category === 'footwear' ? 'mod_foot' : m.category === 'eyewear' ? 'mod_eye' : 'mod_bag',
          id: m.id,
          name: cleaned
        }
      });
    });

    if (wardrobeCategory === 'all') return list;
    return list.filter(item => item.category === wardrobeCategory);
  }, [currentLayers, wardrobeCategory]);

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, item: any) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Face Upload Handler
  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateMannequin({
          ...mannequin,
          faceImageUri: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="w-80 shrink-0 bg-[#141414] border-r border-stone-800/80 flex flex-col h-[calc(100vh-3.5rem)] text-stone-200 select-none relative z-20">
      {/* Top Segmented Controls */}
      <div className="p-3 border-b border-stone-800/80">
        <div className="bg-[#1c1c1c] p-1 rounded-xl flex items-center border border-stone-800">
          <button
            type="button"
            onClick={() => setActiveTab('wardrobe')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'wardrobe'
                ? 'bg-[#262626] text-[#FAF9F5] shadow-sm shadow-black/50 border border-stone-700/50'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shirt className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Tủ Đồ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('layers')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'layers'
                ? 'bg-[#262626] text-[#FAF9F5] shadow-sm shadow-black/50 border border-stone-700/50'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#C0392B]" />
            <span>Lớp Áo ({dynamicLayers.length})</span>
          </button>
        </div>

        {/* Category Pills (Only when Wardrobe active) */}
        {activeTab === 'wardrobe' && (
          <div 
            onWheel={handleHorizontalWheel}
            className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar touch-pan-x snap-x scroll-smooth py-0.5"
          >
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'outer', label: 'Áo ngoài' },
              { id: 'inner', label: 'Yếm' },
              { id: 'bottom', label: 'Quần/Váy' },
              { id: 'acc', label: 'Phụ kiện' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setWardrobeCategory(cat.id as any)}
                className={`px-3 py-1 text-[11px] font-medium rounded-full shrink-0 transition-all duration-200 cursor-pointer snap-start hover:scale-105 active:scale-95 ${
                  wardrobeCategory === cat.id
                    ? 'bg-[#8B0000] text-white shadow-sm shadow-red-900/50'
                    : 'bg-[#1e1e1e] text-stone-400 hover:text-stone-200 hover:bg-[#282828] border border-stone-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar touch-pan-y">
        {activeTab === 'wardrobe' ? (
          <>
            {/* Quick Natural Dye Swatch Bar for Equipped Robe (Horizontal Touch Swipe) */}
            {(() => {
              const hasEquippedOuter = currentLayers.layer3_outer.robeColor && 
                currentLayers.layer3_outer.robeColor !== 'transparent' && 
                currentLayers.layer3_outer.name !== 'Chưa khoác áo ngoài';

              return (
                <div className="bg-[#1a1a1a] p-2.5 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-stone-300 flex items-center gap-1.5">
                      <Palette className={`w-3.5 h-3.5 ${hasEquippedOuter ? 'text-[#D4AF37]' : 'text-stone-500'}`} />
                      <span>
                        Chỉnh màu Thân Áo (
                        <strong className={hasEquippedOuter ? 'text-white' : 'text-stone-500'}>
                          {hasEquippedOuter ? currentLayers.layer3_outer.name : 'Chưa khoác áo ngoài'}
                        </strong>
                        )
                      </span>
                    </span>
                  </div>

                  {!hasEquippedOuter ? (
                    <div className="p-2 bg-stone-900/80 rounded-lg border border-stone-800 text-[10px] text-amber-400/90 text-center">
                      Vui lòng chọn một chiếc áo từ Tủ Đồ bên dưới để mở khóa bảng màu Ngũ Hành.
                    </div>
                  ) : null}

                  <div 
                    onWheel={handleHorizontalWheel}
                    className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x snap-x scroll-smooth py-1"
                  >
                    {HERITAGE_PALETTES.map(p => (
                      <button
                        key={p.hex}
                        type="button"
                        disabled={!hasEquippedOuter}
                        title={hasEquippedOuter ? `${p.name} - ${p.desc}` : 'Cần khoác áo trước khi chọn màu'}
                        onClick={() => hasEquippedOuter && onUpdateOuterColor(p.hex)}
                        className={`w-9 h-8 rounded-lg border flex flex-col items-center justify-center shrink-0 transition-transform relative snap-start ${
                          !hasEquippedOuter
                            ? 'opacity-40 cursor-not-allowed border-stone-800'
                            : currentLayers.layer3_outer.robeColor.toLowerCase() === p.hex.toLowerCase()
                              ? 'border-[#D4AF37] ring-1 ring-[#D4AF37] cursor-pointer hover:scale-105'
                              : 'border-stone-700/60 cursor-pointer hover:scale-105'
                        }`}
                        style={{ backgroundColor: p.hex }}
                      >
                        {hasEquippedOuter && currentLayers.layer3_outer.robeColor.toLowerCase() === p.hex.toLowerCase() && (
                          <Check className={`w-3.5 h-3.5 ${p.hex === '#FAF9F5' ? 'text-stone-900' : 'text-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 2-Column Wardrobe Grid */}
            <div className="grid grid-cols-2 gap-2">
              {wardrobeList.map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.raw)}
                  onClick={() => onEquipItem(item.raw)}
                  className={`group relative p-2.5 rounded-xl border transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between h-32 select-none hover:-translate-y-1 hover:shadow-lg hover:shadow-red-950/20 active:scale-[0.98] ${
                    item.isEquipped
                      ? 'bg-[#1f1616] border-[#8B0000]/80 shadow-md shadow-red-950/30 ring-1 ring-[#8B0000]/60'
                      : 'bg-[#181818] border-stone-800/80 hover:border-stone-600 hover:bg-[#202020]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    {/* Visual 2D Vector Preview Graphic */}
                    {renderItemVectorThumbnail(item)}

                    {item.isEquipped && (
                      <span className="flex items-center gap-0.5 text-[9px] font-semibold text-[#D4AF37] bg-[#2a1e12] px-1.5 py-0.5 rounded-md border border-[#D4AF37]/30 shrink-0">
                        <Check className="w-2.5 h-2.5" /> Đang mặc
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-stone-200 group-hover:text-white line-clamp-1 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-stone-500 mt-0.5 truncate">
                      {item.sub}
                    </p>
                  </div>

                  <div className="text-[9px] text-stone-500 group-hover:text-stone-400 flex items-center justify-between border-t border-stone-800/60 pt-1">
                    <span>Nhấn để chọn</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37]">✦</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Layers Tab: Sleek Reorderable Layers List */
          <div className="space-y-1.5">
            <p className="text-[11px] text-stone-400 px-1 mb-2">
              Thứ tự z-index hiển thị trên người mannequin:
            </p>
            {dynamicLayers.map((layer, index) => {
              const isSelected = selectedLayerId === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => onSelectLayer(isSelected ? null : layer.id)}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#221c1a] border-[#D4AF37]/70 shadow-sm'
                      : 'bg-[#181818] border-stone-800/80 hover:bg-[#1c1c1c]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex flex-col gap-0.5 text-stone-600 hover:text-stone-400">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveLayer(index, 'up');
                        }}
                        className="hover:text-stone-200 disabled:opacity-20 cursor-pointer p-0.5"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === dynamicLayers.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveLayer(index, 'down');
                        }}
                        className="hover:text-stone-200 disabled:opacity-20 cursor-pointer p-0.5"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div
                      className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: layer.color || '#555' }}
                    />

                    <div className="truncate">
                      <p className={`text-xs font-medium truncate ${layer.visible ? 'text-stone-200' : 'text-stone-500 line-through'}`}>
                        {layer.name}
                      </p>
                      <p className="text-[10px] text-stone-500 font-mono">
                        {layer.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onToggleLayerVisibility(layer.id)}
                      title={layer.visible ? "Ẩn lớp" : "Hiện lớp"}
                      className={`p-1.5 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer ${
                        layer.visible ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600'
                      }`}
                    >
                      {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveLayer(layer.id)}
                      title="Gỡ bỏ lớp này"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Footer Button: Customize Mannequin (Opens Popover) */}
      <div className="p-3 border-t border-stone-800/80 bg-[#141414]">
        <button
          type="button"
          onClick={() => setIsMannequinPopoverOpen(true)}
          className="w-full py-2 px-3 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-stone-700/70 text-xs font-semibold text-stone-300 hover:text-white flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <User className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Tùy Chỉnh Mannequin</span>
        </button>
      </div>

      {/* Compact Popover / Modal for Mannequin Customization */}
      {isMannequinPopoverOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-stone-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl text-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-serif">
                  Tùy Chỉnh Mannequin
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMannequinPopoverOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Skin Tone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-400">Tông da mẫu:</label>
              <div className="grid grid-cols-4 gap-2">
                {SKIN_TONES.map(t => (
                  <button
                    key={t.hex}
                    type="button"
                    onClick={() => onUpdateMannequin({ ...mannequin, skinTone: t.hex })}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      mannequin.skinTone === t.hex
                        ? 'border-[#D4AF37] bg-stone-800/80 ring-1 ring-[#D4AF37]'
                        : 'border-stone-800 hover:border-stone-700 bg-stone-900/60'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full border border-black/30 shadow-inner" style={{ backgroundColor: t.hex }} />
                    <span className="text-[10px] text-stone-400">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body Proportion */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-400">Vóc dáng:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'slim', label: 'Thon thả' },
                  { id: 'balanced', label: 'Cân đối' },
                  { id: 'athletic', label: 'Thể thao' }
                ].map(prop => (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => onUpdateMannequin({ ...mannequin, bodyProportion: prop.id as any })}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      mannequin.bodyProportion === prop.id
                        ? 'bg-[#8B0000] border-[#8B0000] text-white'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {prop.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Face Portrait Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-400">Ảnh chân dung cá nhân hóa:</label>
              <div className="flex items-center gap-3">
                {mannequin.faceImageUri ? (
                  <div className="relative group w-12 h-12 rounded-full overflow-hidden border border-[#D4AF37]">
                    <img src={mannequin.faceImageUri} alt="Face" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onUpdateMannequin({ ...mannequin, faceImageUri: undefined })}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-xs text-stone-300 hover:text-white cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Tải ảnh khuôn mặt (Tùy chọn)</span>
                    <input type="file" accept="image/*" onChange={handleFaceUpload} className="hidden" />
                  </label>
                )}
                {mannequin.faceImageUri && (
                  <button
                    type="button"
                    onClick={() => onUpdateMannequin({ ...mannequin, faceImageUri: undefined })}
                    className="text-xs text-stone-500 hover:text-red-400 cursor-pointer"
                  >
                    Gỡ ảnh
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsMannequinPopoverOpen(false)}
                className="w-full py-2 rounded-xl bg-[#8B0000] hover:bg-[#A00000] text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
