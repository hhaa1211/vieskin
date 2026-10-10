import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  AlertTriangle, 
  Check, 
  Wand2, 
  X, 
  BookmarkCheck, 
  Shirt, 
  Layers, 
  Sparkles,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { WardrobeLayerDrawer } from '../studio/WardrobeLayerDrawer';
import { MannequinCanvas } from '../studio/MannequinCanvas';
import { CulturalAIPanel } from '../studio/CulturalAIPanel';
import { UndoToast } from '../common/UndoToast';
import { sanitizeText } from '../../utils/security';
import { 
  GARMENTS_LORE, 
  WARDROBE_ITEMS, 
  INITIAL_MANNEQUIN 
} from '../../data/culturalData';
import { 
  GarmentLayerState, 
  MannequinSettings, 
  GarmentFamily, 
  EtiquetteAuditResult, 
  SavedOutfit, 
  DynamicLayerItem,
  LapelDirection,
  OccasionContext
} from '../../types';

interface MixMatchStudioScreenProps {
  currentLayers: GarmentLayerState;
  onLayersChange: (layers: GarmentLayerState) => void;
  onSaveOutfit: (outfit: SavedOutfit) => void;
  onGoToLookbook: () => void;
}

export const MixMatchStudioScreen: React.FC<MixMatchStudioScreenProps> = ({
  currentLayers,
  onLayersChange,
  onSaveOutfit,
  onGoToLookbook
}) => {
  // Mannequin State
  const [mannequin, setMannequin] = useState<MannequinSettings>(INITIAL_MANNEQUIN);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<GarmentLayerState[]>([]);
  const [future, setFuture] = useState<GarmentLayerState[]>([]);

  // Selected Layer on Canvas
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // A/B Comparison State
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false);
  const [activeTarget, setActiveTarget] = useState<'A' | 'B'>('A');
  const [outfitB, setOutfitB] = useState<GarmentLayerState>(() => ({
    ...currentLayers,
    layer3_outer: {
      ...currentLayers.layer3_outer,
      family: 'ao_ngu_than_chen',
      name: 'Áo Ngũ Thân Tay Chẽn',
      robeColor: '#0F172A',
      collarColor: '#FAF9F5',
      trimColor: '#475569',
      patternType: 'hoa_cuc'
    },
    layer5_modernAccessory: {
      footwearId: 'chelsea_boots',
      eyewearId: 'kinh_ram_retro',
      bagId: 'canvas_tote'
    }
  }));

  // Helper to commit state with history tracking
  const updateLayers = useCallback((newLayers: GarmentLayerState, target: 'A' | 'B' = 'A') => {
    if (isSplitMode && target === 'B') {
      setOutfitB(newLayers);
      return;
    }

    setHistory(prev => [...prev.slice(-15), currentLayers]);
    setFuture([]);
    onLayersChange(newLayers);
  }, [currentLayers, isSplitMode, onLayersChange]);

  // Smart Gender Switch Handler (Scenario 1.2)
  const handleUpdateMannequin = useCallback((newSettings: MannequinSettings) => {
    const previousGender = mannequin.genderPresentation || 'female';
    const newGender = newSettings.genderPresentation || 'female';

    setMannequin(newSettings);

    // Kịch bản 1.2: Switch Female -> Male when wearing female-exclusive items
    if (previousGender !== 'male' && newGender === 'male') {
      const isWearingNhatBinh = currentLayers.layer3_outer.family === 'ao_nhat_binh';
      const isWearingTuThan = currentLayers.layer3_outer.family === 'ao_tu_than';
      const isWearingYem = currentLayers.layer1_inner.id === 'yem_inner' || currentLayers.layer1_inner.visible;

      if (isWearingNhatBinh || isWearingTuThan || isWearingYem) {
        const nextOuterFamily = isWearingNhatBinh ? 'ao_tac' : isWearingTuThan ? 'ao_ngu_than_chen' : currentLayers.layer3_outer.family;
        const nextOuterName = isWearingNhatBinh ? 'Áo Tấc Nam' : isWearingTuThan ? 'Áo Ngũ Thân Tay Chẽn Nam' : currentLayers.layer3_outer.name;

        const nextLayers: GarmentLayerState = {
          ...currentLayers,
          layer1_inner: { id: 'none', name: 'Chưa mặc yếm', color: 'transparent', visible: false },
          layer3_outer: {
            ...currentLayers.layer3_outer,
            family: nextOuterFamily,
            name: nextOuterName
          }
        };

        updateLayers(nextLayers);

        setPassiveEtiquetteToast({
          show: true,
          message: 'Áo Nhật Bình & Yếm là lễ phục nữ quý tộc; hệ thống đã tự động chuyển sang Áo Tấc/Ngũ Thân nam tương ứng.'
        });
      }
    }
  }, [mannequin, currentLayers, updateLayers]);

  // Passive Amber Toast for Etiquette Warnings
  const [passiveEtiquetteToast, setPassiveEtiquetteToast] = useState<{
    show: boolean;
    message: string;
    fixAction?: () => void;
  } | null>(null);

  // Undo Toast for Defensive Layer Deletion
  const [pendingDeleteLayer, setPendingDeleteLayer] = useState<{
    layer: DynamicLayerItem;
    layersState: GarmentLayerState;
  } | null>(null);

  // Saved to Lookbook Toast & Naming Modal
  const [isSavedToastOpen, setIsSavedToastOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [customOutfitTitle, setCustomOutfitTitle] = useState('');
  const [customOutfitConcept, setCustomOutfitConcept] = useState('');
  const [customOccasion, setCustomOccasion] = useState<OccasionContext>('yearbook_graduation');

  // AI Stylist State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any | null>(null);

  // AI Fusion State
  const [enableAiFusion, setEnableAiFusion] = useState<boolean>(true);

  // Responsive Drawer & FAB States (Mobile & Tablet Ergonomics)
  const [isWardrobeExpanded, setIsWardrobeExpanded] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [mobileQuickCategory, setMobileQuickCategory] = useState<'all' | 'outer' | 'inner' | 'bottom' | 'acc'>('all');
  const [bottomSheetStage, setBottomSheetStage] = useState<'collapsed' | 'half' | 'full'>('collapsed');
  const [isEtiquetteDetailSheetOpen, setIsEtiquetteDetailSheetOpen] = useState<boolean>(false);

  // Global Escape key dismiss for Studio modals/drawers (WCAG 2.2 AA)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAiDrawerOpen) setIsAiDrawerOpen(false);
        if (isEtiquetteDetailSheetOpen) setIsEtiquetteDetailSheetOpen(false);
        if (isSaveModalOpen) setIsSaveModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAiDrawerOpen, isEtiquetteDetailSheetOpen, isSaveModalOpen]);

  const handleToggleAiFusion = useCallback(() => {
    setEnableAiFusion(prev => {
      const next = !prev;
      setPassiveEtiquetteToast({
        show: true,
        message: next 
          ? "Đã bật AI Smart Layer Fusion: Tự động lồng ghép vạt áo & hiệu ứng nếp vải depth shadow" 
          : "Đã tắt AI Smart Layer Fusion: Hiển thị chế độ vector phẳng tiêu chuẩn"
      });
      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setFuture(prev => [currentLayers, ...prev]);
    onLayersChange(previous);
  }, [history, currentLayers, onLayersChange]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setHistory(prev => [...prev, currentLayers]);
    onLayersChange(next);
  }, [future, currentLayers, onLayersChange]);

  // Dynamic Layers Resolution
  const ensureDynamicLayers = useCallback((layers: GarmentLayerState): DynamicLayerItem[] => {
    const existing = layers.dynamicLayers || [];
    const getExisting = (id: string) => existing.find(l => l.id === id);

    const items: DynamicLayerItem[] = [];

    // Outer Robe (Only if active)
    if (layers.layer3_outer.robeColor && layers.layer3_outer.robeColor !== 'transparent' && layers.layer3_outer.name !== 'Chưa khoác áo ngoài') {
      const exist = getExisting('layer_outer');
      items.push({
        id: 'layer_outer',
        category: 'outer',
        name: layers.layer3_outer.name || 'Áo Ngoài',
        family: layers.layer3_outer.family,
        visible: exist?.visible ?? true,
        locked: exist?.locked ?? false,
        color: layers.layer3_outer.robeColor,
        collarColor: layers.layer3_outer.collarColor,
        trimColor: layers.layer3_outer.trimColor,
        lapelDirection: layers.layer3_outer.lapelDirection,
        aiCollarMasking: true,
        transform: exist?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // Inner Slip / Yếm (Only if active)
    if (layers.layer1_inner.color && layers.layer1_inner.color !== 'transparent' && layers.layer1_inner.name && layers.layer1_inner.name !== 'Chưa mặc yếm') {
      const exist = getExisting('layer_inner');
      items.push({
        id: 'layer_inner',
        category: 'inner',
        name: layers.layer1_inner.name || 'Yếm Đào',
        visible: exist?.visible ?? (layers.layer1_inner.visible ?? true),
        locked: exist?.locked ?? false,
        color: layers.layer1_inner.color,
        aiCollarMasking: true,
        transform: exist?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // Bottom (Only if active)
    if (layers.layer2_bottom.color && layers.layer2_bottom.color !== 'transparent' && layers.layer2_bottom.name !== 'Chưa mặc hạ y') {
      const exist = getExisting('layer_bottom');
      items.push({
        id: 'layer_bottom',
        category: 'bottom',
        name: layers.layer2_bottom.name || 'Hạ Y',
        visible: exist?.visible ?? true,
        locked: exist?.locked ?? false,
        color: layers.layer2_bottom.color,
        transform: exist?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // Traditional Headwear
    if (layers.layer4_tradAccessory.headwearId) {
      const exist = getExisting('layer_headwear');
      items.push({
        id: 'layer_headwear',
        category: 'trad_accessory',
        name: layers.layer4_tradAccessory.headwearName || 'Khăn Vấn',
        type: layers.layer4_tradAccessory.headwearId,
        color: layers.layer4_tradAccessory.headwearColor || '#0F172A',
        visible: exist?.visible ?? true,
        locked: exist?.locked ?? false,
        transform: exist?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // Jewelry
    if (layers.layer4_tradAccessory.jewelryId) {
      const exist = getExisting('layer_jewelry');
      items.push({
        id: 'layer_jewelry',
        category: 'trad_accessory',
        name: layers.layer4_tradAccessory.jewelryName || 'Trang Sức',
        type: layers.layer4_tradAccessory.jewelryId,
        color: '#059669',
        visible: exist?.visible ?? true,
        locked: exist?.locked ?? false,
        transform: exist?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // Eyewear
    if (layers.layer5_modernAccessory.eyewearId) {
      const exist = getExisting('layer_eyewear');
      items.push({
        id: 'layer_eyewear',
        category: 'modern_accessory',
        name: layers.layer5_modernAccessory.eyewearName || 'Kính Râm',
        type: layers.layer5_modernAccessory.eyewearId,
        visible: exist?.visible ?? true,
        locked: exist?.locked ?? false,
        transform: exist?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // Bag
    if (layers.layer5_modernAccessory.bagId) {
      const exist = getExisting('layer_bag');
      items.push({
        id: 'layer_bag',
        category: 'modern_accessory',
        name: layers.layer5_modernAccessory.bagName || 'Túi Xách',
        type: layers.layer5_modernAccessory.bagId,
        visible: exist?.visible ?? true,
        locked: exist?.locked ?? false,
        transform: exist?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // Footwear
    if (layers.layer5_modernAccessory.footwearId || layers.layer4_tradAccessory.footwearId) {
      const exist = getExisting('layer_footwear');
      items.push({
        id: 'layer_footwear',
        category: 'modern_accessory',
        name: layers.layer5_modernAccessory.footwearName || 'Giày Dép',
        type: layers.layer5_modernAccessory.footwearId || layers.layer4_tradAccessory.footwearId,
        visible: exist?.visible ?? true,
        locked: exist?.locked ?? false,
        color: '#FFFFFF',
        transform: exist?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // Append custom dynamic items
    const custom = existing.filter(l => 
      !['layer_outer', 'layer_inner', 'layer_bottom', 'layer_headwear', 'layer_jewelry', 'layer_eyewear', 'layer_bag', 'layer_footwear'].includes(l.id)
    );

    return [...items, ...custom];
  }, []);

  const activeTargetLayers = isSplitMode && activeTarget === 'B' ? outfitB : currentLayers;
  const currentDynamicLayers = ensureDynamicLayers(activeTargetLayers);

  // Quick Wardrobe Items for Mobile Peeking Bottom Sheet
  const quickWardrobeItems = useMemo(() => {
    const outers = GARMENTS_LORE.map(lore => ({
      id: lore.family,
      name: (lore.name || '').normalize('NFC'),
      category: 'outer',
      color: lore.defaultColors.robe,
      accentColor: lore.defaultColors.collar
    }));

    const inners = WARDROBE_ITEMS.inners.map(item => ({
      ...item,
      name: (item.name || '').normalize('NFC'),
      category: 'inner'
    }));

    const bottoms = WARDROBE_ITEMS.bottoms.map(item => ({
      ...item,
      name: (item.name || '').normalize('NFC'),
      category: 'bottom'
    }));

    const accs = [
      { id: 'khan_van_den', name: 'Khăn Vấn Đen', category: 'trad_head', color: '#0F172A' },
      { id: 'non_quai_thao', name: 'Nón Quai Thao', category: 'trad_head', color: '#D97706' },
      { id: 'kieng_bac', name: 'Kiềng Bạc Cung Đình', category: 'trad_jewel', color: '#E2E8F0' },
      { id: 'guoc_moc_de_day', name: 'Guốc Mộc Y2K', category: 'mod_foot', color: '#854D0E' },
      { id: 'sneaker_chunky_black', name: 'Sneaker Chunky', category: 'mod_foot', color: '#FFFFFF' },
      { id: 'tui_dan_soi', name: 'Túi Đan Sợi Tự Nhiên', category: 'mod_bag', color: '#FAF9F5' }
    ];

    if (mobileQuickCategory === 'outer') return outers;
    if (mobileQuickCategory === 'inner') return inners;
    if (mobileQuickCategory === 'bottom') return bottoms;
    if (mobileQuickCategory === 'acc') return accs;

    return [
      ...outers.slice(0, 5),
      ...inners.slice(0, 3),
      ...bottoms.slice(0, 3),
      ...accs.slice(0, 3)
    ];
  }, [mobileQuickCategory]);

  // Equip an item from Wardrobe
  const handleEquipItem = useCallback((item: any) => {
    const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
    const base = isSplitMode && activeTarget === 'B' ? outfitB : currentLayers;
    let next = { ...base };

    if (item.category === 'outer') {
      const lore = GARMENTS_LORE.find(g => g.family === item.id || g.family === item.family);
      next = {
        ...next,
        layer3_outer: {
          ...next.layer3_outer,
          family: (lore?.family || item.family || item.id) as GarmentFamily,
          name: lore?.name || item.name || next.layer3_outer.name,
          robeColor: item.color || lore?.defaultColors.robe || next.layer3_outer.robeColor || '#1E3A8A',
          collarColor: lore?.defaultColors.collar || next.layer3_outer.collarColor || '#1E293B',
          trimColor: lore?.defaultColors.trim || next.layer3_outer.trimColor || '#D97706'
        }
      };
    } else if (item.category === 'inner') {
      next = {
        ...next,
        layer1_inner: {
          id: item.id,
          name: item.name,
          color: item.color,
          visible: true
        }
      };
    } else if (item.category === 'bottom') {
      next = {
        ...next,
        layer2_bottom: {
          id: item.id,
          name: item.name,
          color: item.color,
          type: item.type || 'trousers'
        }
      };
    } else if (item.category === 'trad_head') {
      next = {
        ...next,
        layer4_tradAccessory: {
          ...next.layer4_tradAccessory,
          headwearId: item.id,
          headwearName: item.name,
          headwearColor: item.color || '#0F172A'
        }
      };
    } else if (item.category === 'trad_jewel') {
      next = {
        ...next,
        layer4_tradAccessory: {
          ...next.layer4_tradAccessory,
          jewelryId: item.id,
          jewelryName: item.name
        }
      };
    } else if (item.category === 'mod_foot') {
      next = {
        ...next,
        layer5_modernAccessory: {
          ...next.layer5_modernAccessory,
          footwearId: item.id,
          footwearName: item.name
        }
      };
    } else if (item.category === 'mod_eye') {
      next = {
        ...next,
        layer5_modernAccessory: {
          ...next.layer5_modernAccessory,
          eyewearId: item.id,
          eyewearName: item.name
        }
      };
    } else if (item.category === 'mod_bag') {
      next = {
        ...next,
        layer5_modernAccessory: {
          ...next.layer5_modernAccessory,
          bagId: item.id,
          bagName: item.name
        }
      };
    }

    const nextWithDyn = {
      ...next,
      dynamicLayers: ensureDynamicLayers(next)
    };

    updateLayers(nextWithDyn, target);
  }, [currentLayers, outfitB, isSplitMode, activeTarget, ensureDynamicLayers, updateLayers]);

  // Update outer robe color via swatch
  const handleUpdateOuterColor = useCallback((color: string) => {
    const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
    const base = isSplitMode && activeTarget === 'B' ? outfitB : currentLayers;
    const next = {
      ...base,
      layer3_outer: {
        ...base.layer3_outer,
        robeColor: color
      }
    };
    const nextWithDyn = {
      ...next,
      dynamicLayers: ensureDynamicLayers(next)
    };
    updateLayers(nextWithDyn, target);
  }, [currentLayers, outfitB, isSplitMode, activeTarget, ensureDynamicLayers, updateLayers]);

  // Update Layer Transform (Position X, Y, Scale, Rotation)
  const handleUpdateLayerTransform = useCallback((layerId: string, transform: { x: number; y: number; scale: number; rotation: number }) => {
    const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
    const base = isSplitMode && activeTarget === 'B' ? outfitB : currentLayers;
    const dyn = ensureDynamicLayers(base);
    const updated = dyn.map(l => l.id === layerId ? { ...l, transform } : l);

    if (!updated.some(l => l.id === layerId)) {
      updated.push({
        id: layerId,
        category: 'modern_accessory',
        name: 'Phụ kiện',
        visible: true,
        locked: false,
        transform
      });
    }

    updateLayers({ ...base, dynamicLayers: updated }, target);
  }, [currentLayers, outfitB, isSplitMode, activeTarget, ensureDynamicLayers, updateLayers]);

  // Toggle Layer Lock
  const handleToggleLayerLock = useCallback((layerId: string) => {
    const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
    const base = isSplitMode && activeTarget === 'B' ? outfitB : currentLayers;
    const dyn = ensureDynamicLayers(base);
    const updated = dyn.map(l => l.id === layerId ? { ...l, locked: !l.locked } : l);
    updateLayers({ ...base, dynamicLayers: updated }, target);
  }, [currentLayers, outfitB, isSplitMode, activeTarget, ensureDynamicLayers, updateLayers]);

  // Toggle Visibility of a layer
  const handleToggleLayerVisibility = useCallback((layerId: string) => {
    const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
    const base = isSplitMode && activeTarget === 'B' ? outfitB : currentLayers;

    const dyn = ensureDynamicLayers(base);
    const targetItem = dyn.find(l => l.id === layerId);
    const newVisible = targetItem ? !targetItem.visible : false;
    const updated = dyn.map(l => l.id === layerId ? { ...l, visible: newVisible } : l);

    let next = {
      ...base,
      dynamicLayers: updated
    };

    if (layerId === 'layer_inner') {
      next.layer1_inner = {
        ...next.layer1_inner,
        visible: newVisible
      };
    }

    updateLayers(next, target);
  }, [currentLayers, outfitB, isSplitMode, activeTarget, ensureDynamicLayers, updateLayers]);

  // Remove Layer (Defensive with UndoToast)
  const handleRemoveLayer = useCallback((layerId: string) => {
    const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
    const base = isSplitMode && activeTarget === 'B' ? outfitB : currentLayers;
    const targetLayer = currentDynamicLayers.find(l => l.id === layerId);

    if (targetLayer) {
      setPendingDeleteLayer({
        layer: targetLayer,
        layersState: JSON.parse(JSON.stringify(base))
      });
    }

    let next = { ...base };
    if (layerId === 'layer_outer') {
      next.layer3_outer = {
        ...next.layer3_outer,
        id: '',
        name: 'Chưa khoác áo ngoài',
        family: 'ao_ngu_than_chen',
        robeColor: 'transparent',
        collarColor: 'transparent',
        trimColor: 'transparent'
      };
    } else if (layerId === 'layer_inner') {
      next.layer1_inner = { ...next.layer1_inner, id: '', name: 'Chưa mặc yếm', color: 'transparent', visible: false };
    } else if (layerId === 'layer_bottom') {
      next.layer2_bottom = { ...next.layer2_bottom, id: '', name: 'Chưa mặc hạ y', color: 'transparent' };
    } else if (layerId === 'layer_headwear') {
      next.layer4_tradAccessory = { ...next.layer4_tradAccessory, headwearId: undefined, headwearName: undefined };
    } else if (layerId === 'layer_jewelry') {
      next.layer4_tradAccessory = { ...next.layer4_tradAccessory, jewelryId: undefined, jewelryName: undefined };
    } else if (layerId === 'layer_eyewear') {
      next.layer5_modernAccessory = { ...next.layer5_modernAccessory, eyewearId: undefined, eyewearName: undefined };
    } else if (layerId === 'layer_bag') {
      next.layer5_modernAccessory = { ...next.layer5_modernAccessory, bagId: undefined, bagName: undefined };
    } else if (layerId === 'layer_footwear') {
      next.layer5_modernAccessory = { ...next.layer5_modernAccessory, footwearId: undefined, footwearName: undefined };
    }

    if (next.dynamicLayers) {
      next.dynamicLayers = next.dynamicLayers.filter(l => l.id !== layerId);
    }

    updateLayers(next, target);
    if (selectedLayerId === layerId) setSelectedLayerId(null);
  }, [currentLayers, outfitB, isSplitMode, activeTarget, currentDynamicLayers, selectedLayerId, updateLayers]);

  // Undo delete layer
  const handleUndoDeleteLayer = useCallback(() => {
    if (pendingDeleteLayer) {
      const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
      updateLayers(pendingDeleteLayer.layersState, target);
      setPendingDeleteLayer(null);
    }
  }, [pendingDeleteLayer, isSplitMode, activeTarget, updateLayers]);

  // Reorder Layer (Up/Down)
  const handleMoveLayer = useCallback((index: number, direction: 'up' | 'down') => {
    const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
    const base = isSplitMode && activeTarget === 'B' ? outfitB : currentLayers;
    const list = [...currentDynamicLayers];
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    updateLayers({ ...base, dynamicLayers: list }, target);
  }, [currentLayers, outfitB, isSplitMode, activeTarget, currentDynamicLayers, updateLayers]);

  // Toggle Lapel Direction
  const handleToggleLapel = useCallback(() => {
    const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
    const base = isSplitMode && activeTarget === 'B' ? outfitB : currentLayers;
    const nextDir: LapelDirection = 
      base.layer3_outer.lapelDirection === 'right_over_left' ? 'left_over_right' : 'right_over_left';

    const next = {
      ...base,
      layer3_outer: {
        ...base.layer3_outer,
        lapelDirection: nextDir
      }
    };
    updateLayers(next, target);
  }, [currentLayers, outfitB, isSplitMode, activeTarget, updateLayers]);

  // Reset Canvas to Empty (Không mặc gì)
  const handleResetCanvas = useCallback(() => {
    const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
    const resetState: GarmentLayerState = {
      layer1_inner: { id: '', name: 'Chưa mặc yếm', color: 'transparent', visible: false },
      layer2_bottom: { id: '', name: 'Chưa mặc hạ y', color: 'transparent', type: 'culottes' },
      layer3_outer: {
        id: '',
        name: 'Chưa khoác áo ngoài',
        family: 'ao_ngu_than_chen',
        robeColor: 'transparent',
        collarColor: 'transparent',
        trimColor: 'transparent',
        patternType: 'plain',
        lapelDirection: 'right_over_left'
      },
      layer4_tradAccessory: {},
      layer5_modernAccessory: {},
      dynamicLayers: [],
      enableAiFusion: true
    };
    updateLayers(resetState, target);
    setSelectedLayerId(null);
  }, [isSplitMode, activeTarget, updateLayers]);

  // A/B Compare Actions
  const handleCloneAToB = useCallback(() => {
    setOutfitB(JSON.parse(JSON.stringify(currentLayers)));
    setActiveTarget('B');
  }, [currentLayers]);

  const handleSelectWinnerB = useCallback(() => {
    onLayersChange(outfitB);
    setIsSplitMode(false);
    setActiveTarget('A');
  }, [outfitB, onLayersChange]);

  // Cultural Audit Engine & Passive Amber Toast Trigger
  const auditResult = React.useMemo<EtiquetteAuditResult>(() => {
    const active = activeTargetLayers;
    const issues: any[] = [];
    let isAuthentic = true;
    let computedScore = 100;

    const hasOuter = active.layer3_outer.robeColor && 
      active.layer3_outer.robeColor !== 'transparent' && 
      active.layer3_outer.name !== 'Chưa khoác áo ngoài';

    const hasInner = active.layer1_inner.color && 
      active.layer1_inner.color !== 'transparent' && 
      active.layer1_inner.name && 
      active.layer1_inner.name !== 'Chưa mặc yếm' && 
      active.layer1_inner.visible;

    const hasBottom = active.layer2_bottom.color && 
      active.layer2_bottom.color !== 'transparent' && 
      active.layer2_bottom.name && 
      active.layer2_bottom.name !== 'Chưa mặc hạ y';

    const hasHeadwear = !!active.layer4_tradAccessory.headwearId;

    // Check 0: Zero State (Kịch bản 1.1)
    if (!hasOuter && !hasInner && !hasBottom) {
      return {
        isAuthentic: false,
        score: 0,
        issues: [{
          severity: 'warning',
          code: 'ZERO_STATE',
          title: 'Chưa phối trang phục',
          description: 'Trạng thái khởi tạo: Hãy chọn lớp áo trong hoặc thân áo chính để bắt đầu.',
          solution: 'Hãy chọn lớp áo trong hoặc thân áo chính để bắt đầu.'
        }],
        guidance: 'Hãy chọn lớp áo trong hoặc thân áo chính để bắt đầu.'
      };
    }

    // Check 1: Inverted Lapel (Tả nhiệm)
    if (hasOuter && active.layer3_outer.lapelDirection === 'left_over_right') {
      isAuthentic = false;
      computedScore -= 35;
      issues.push({
        severity: 'critical',
        code: 'INVERTED_LAPEL',
        title: 'Sai lệch vạt áo (Tả nhiệm)',
        description: 'Vạt áo cài từ trái qua phải (Tả nhiệm) là điều tối kỵ trong cổ phục người Việt. Chuẩn mực cổ truyền luôn là Hữu nhiệm (Vạt phải đè vạt trái).',
        solution: 'Đổi hướng vạt về Hữu nhiệm.'
      });
    }

    // Check 2: Áo Tứ Thân missing Yếm
    if (active.layer3_outer.family === 'ao_tu_than' && !hasInner) {
      isAuthentic = false;
      computedScore -= 25;
      issues.push({
        severity: 'critical',
        code: 'TU_THAN_NO_YEM',
        title: 'Áo Tứ Thân thiếu Yếm lót trong',
        description: 'Áo Tứ Thân xẻ hai vạt trước, cần có Yếm đào hoặc Yếm lụa bên trong để giữ nét duyên dáng thanh lịch.',
        solution: 'Bật hiển thị Yếm lót trong.'
      });
    }

    // Check 3: Missing Lower Garment (Kịch bản 2.2)
    if (hasOuter && !hasBottom) {
      isAuthentic = false;
      computedScore -= 25; // Score becomes ~75/100
      issues.push({
        severity: 'warning',
        code: 'MISSING_BOTTOM',
        title: 'Trang phục chưa hoàn thiện (Thiếu hạ y)',
        description: 'Trang phục chưa hoàn thiện: Cổ phục Việt luôn đi kèm quần lụa trắng/đen hoặc váy đụp bên trong.',
        solution: 'Chọn một chiếc Quần Lụa hoặc Chân Váy trong Tủ Đồ.'
      });
    }

    // Check 4: AI Fusion OFF Layer Conflict (Kịch bản 3.1)
    if (hasOuter && hasInner && enableAiFusion === false) {
      isAuthentic = false;
      computedScore -= 20;
      issues.push({
        severity: 'warning',
        code: 'AI_FUSION_OFF_CONFLICT',
        title: 'Vi phạm thứ tự trang phục (Yếm lót)',
        description: 'Yếm lót không được mặc đè lên thân áo ngoài. Bật ⚡ AI Fusion để tự động lồng Yếm vào sau tà áo.',
        solution: 'Bật công tắc ⚡ AI Fusion trên canvas.'
      });
    }

    // Check 5: Five Element Color Clash (Kịch bản 4.2)
    const outerColor = (active.layer3_outer.robeColor || '').toLowerCase();
    const headwearColor = (active.layer4_tradAccessory.headwearColor || '').toLowerCase();
    const isRedOuter = outerColor.includes('dc2626') || outerColor.includes('b91c1c') || outerColor.includes('991b1b') || outerColor.includes('e11d48') || outerColor.includes('d97706');
    const isBlackHeadwear = headwearColor.includes('0f172a') || headwearColor.includes('1e293b') || headwearColor.includes('000000') || headwearColor.includes('1e1b4b');

    if (isRedOuter && isBlackHeadwear) {
      issues.push({
        severity: 'warning',
        code: 'COLOR_CLASH_THUY_HOA',
        title: 'Phối màu Thủy - Hỏa tương khắc',
        description: 'Phối màu Thủy - Hỏa tương khắc. Bạn có thể cân nhắc đổi khăn vấn sang màu Xanh lục (Mộc - tương sinh) hoặc Đỏ đồng điệu để tổng thể hài hòa hơn.',
        solution: 'Đổi khăn vấn sang màu Xanh Lục Ngọc hoặc Đỏ Son.'
      });
    }

    // Check 6: Accessory Displaced / Floating Out of Bounds (Kịch bản 5.2)
    const dyns = active.dynamicLayers || [];
    dyns.forEach(l => {
      if (l.transform) {
        const { x = 0, y = 0, scale = 1 } = l.transform;
        if (Math.abs(x) > 65 || Math.abs(y) > 75 || scale > 2.2 || scale < 0.4) {
          isAuthentic = false;
          computedScore -= 40; // Score drops to ~60/100
          issues.push({
            severity: 'critical',
            code: 'ACCESSORY_DISPLACED',
            title: `Phụ kiện "${l.name}" bị chệch tọa độ`,
            description: 'Phụ kiện đầu đang bị đặt lệch khỏi vị trí đội quy chuẩn.',
            solution: 'Thả chuột/ngón tay để phụ kiện tự hít (snap) về vị trí quy chuẩn.'
          });
        }
      }
    });

    // Check 7: Formal Robe missing Traditional Headwear
    if ((active.layer3_outer.family === 'ao_nhat_binh' || active.layer3_outer.family === 'ao_tac') && !hasHeadwear) {
      issues.push({
        severity: 'warning',
        code: 'FORMAL_NO_HEADWEAR',
        title: 'Lễ phục chưa có Khăn Vấn / Nón',
        description: 'Dự lễ trang trọng với Áo Tấc hoặc Nhật Bình nên có Khăn vấn hoặc Nón bài thơ để đủ bộ y phục triều đình.',
        solution: 'Đội thêm Khăn Vấn Nhung hoặc Nón Bài Thơ.'
      });
    }

    // Explicit Weighted Scoring Formula:
    // Điểm Tổng = Lớp Áo Chuẩn * 40% + Hạ Y / Yếm * 30% + Ngũ Hành Hài Hòa * 30%

    // 1. Lớp Áo Chuẩn (Outer Robe - 40% Weight)
    let robeScore = 0;
    if (hasOuter) {
      robeScore = 40;
      if (active.layer3_outer.lapelDirection === 'left_over_right') {
        robeScore -= 20; // Inverted lapel penalty
      }
      if (active.layer3_outer.family === 'ao_tu_than' && !hasInner) {
        robeScore -= 15; // Tứ Thân missing Yếm penalty
      }
    }

    // 2. Hạ Y / Yếm (Lower Garment & Slip - 30% Weight)
    let bottomSlipScore = 0;
    if (hasBottom && hasInner) {
      bottomSlipScore = 30;
    } else if (hasBottom) {
      bottomSlipScore = 20;
    } else if (hasInner) {
      bottomSlipScore = 10;
    }

    // 3. Ngũ Hành Hài Hòa & Quy Chuẩn (Five Elements & Protocol - 30% Weight)
    let harmonyScore = 30;
    if (isRedOuter && isBlackHeadwear) {
      harmonyScore -= 15; // Color clash
    }
    if ((active.layer3_outer.family === 'ao_nhat_binh' || active.layer3_outer.family === 'ao_tac') && !hasHeadwear) {
      harmonyScore -= 10;
    }
    if (issues.some(i => i.code === 'ACCESSORY_DISPLACED')) {
      harmonyScore -= 15;
    }

    let rawScore = Math.max(0, robeScore) + Math.max(0, bottomSlipScore) + Math.max(0, harmonyScore);

    // Enforcement of Maximum Score Caps:
    // "Khi thiếu áo hoặc thiếu hạ y, điểm số tối đa không thể vượt quá 30% - 40%"
    if (!hasOuter) {
      rawScore = Math.min(rawScore, 30); // Max score capped at 30% when outer coat missing
    }
    if (!hasBottom) {
      rawScore = Math.min(rawScore, 40); // Max score capped at 40% when bottom garment missing
    }
    if (!hasOuter && !hasBottom) {
      rawScore = Math.min(rawScore, 10);
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    return {
      isAuthentic: isAuthentic && issues.length === 0,
      score: finalScore,
      issues,
      guidance: issues.length === 0
        ? 'Trang phục chuẩn mực Hữu nhiệm, phụ kiện chuẩn vị trí, lớp lang thứ bậc hài hòa theo quy chế Đại Việt & thời Nguyễn.'
        : `Phát hiện ${issues.length} lưu ý văn hóa / tọa độ phụ kiện cần kiểm tra hiệu chỉnh.`
    };
  }, [activeTargetLayers, enableAiFusion]);

  // Auto-Fix Cultural Issues
  const handleAutoFix = useCallback(() => {
    const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
    const base = isSplitMode && activeTarget === 'B' ? outfitB : currentLayers;
    const next = {
      ...base,
      layer3_outer: {
        ...base.layer3_outer,
        lapelDirection: 'right_over_left' as LapelDirection
      },
      layer1_inner: {
        ...base.layer1_inner,
        visible: true
      }
    };

    // Reset displaced accessories back to standard anchor coordinates
    if (next.dynamicLayers && next.dynamicLayers.length > 0) {
      next.dynamicLayers = next.dynamicLayers.map(l => ({
        ...l,
        transform: { x: 0, y: 0, scale: 1, rotation: 0 }
      }));
    }

    // Add traditional headwear if missing on formal robe
    if (
      (next.layer3_outer.family === 'ao_nhat_binh' || next.layer3_outer.family === 'ao_tac') &&
      !next.layer4_tradAccessory.headwearId
    ) {
      next.layer4_tradAccessory = {
        ...next.layer4_tradAccessory,
        headwearId: 'khan_van_nhung',
        headwearName: 'Khăn Vấn Nhung',
        headwearColor: '#0F172A'
      };
    }

    // Replace footwear if chunky sneakers on royal attire
    if (
      next.layer3_outer.family === 'ao_nhat_binh' &&
      next.layer5_modernAccessory.footwearId === 'chunky_sneakers'
    ) {
      next.layer5_modernAccessory = {
        ...next.layer5_modernAccessory,
        footwearId: 'hai_theu',
        footwearName: 'Hài Thêu Hoa Cúc'
      };
    }

    updateLayers(next, target);
  }, [currentLayers, outfitB, isSplitMode, activeTarget, updateLayers]);

  // Passive Amber Toast Effect (triggers gently without intrusive alerts)
  useEffect(() => {
    if (auditResult.issues.length > 0) {
      const topIssue = auditResult.issues[0];
      const msg = topIssue.title + ': ' + topIssue.solution;
      setPassiveEtiquetteToast(prev => {
        if (prev && prev.message === msg) return prev;
        return {
          show: true,
          message: msg,
          fixAction: () => {
            handleAutoFix();
            setPassiveEtiquetteToast(null);
          }
        };
      });
    } else {
      setPassiveEtiquetteToast(prev => (prev === null ? null : null));
    }
  }, [auditResult, handleAutoFix]);

  // Ask AI Stylist (Kịch bản 6.1 & 6.2)
  const handleAskAiStylist = async (prompt: string) => {
    const query = sanitizeText(prompt, 200);
    if (!query) return;

    setIsAiLoading(true);

    // Kịch bản 6.1: Prompt pill shortcut "✨ Kỷ yếu Văn Miếu"
    if (query.toLowerCase().includes('kỷ yếu') || query.toLowerCase().includes('văn miếu')) {
      setTimeout(() => {
        const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
        const base = isSplitMode && activeTarget === 'B' ? outfitB : currentLayers;

        const next: GarmentLayerState = {
          ...base,
          layer1_inner: { id: '', name: 'Chưa mặc yếm', color: 'transparent', visible: false },
          layer2_bottom: { id: 'quan_lua_trang', name: 'Quần Lụa Trắng', color: '#FAF9F5', type: 'trousers' },
          layer3_outer: {
            id: 'ao_tac_thuy_lam',
            name: 'Áo Tấc Thụy Lam',
            family: 'ao_tac',
            robeColor: '#38BDF8',
            collarColor: '#FAF9F5',
            trimColor: '#0284C7',
            patternType: 'thuy_ba',
            lapelDirection: 'right_over_left'
          },
          layer4_tradAccessory: {
            headwearId: 'khan_van_nhung',
            headwearName: 'Khăn Vấn Đen',
            headwearColor: '#0F172A'
          },
          layer5_modernAccessory: {
            footwearId: 'giay_oxford_da',
            footwearName: 'Giày Oxford Da'
          }
        };

        updateLayers(next, target);
        setIsAiLoading(false);

        setAiRecommendation({
          outfitTitle: "Áo Tấc Thụy Lam x Quần Lụa Trắng & Giày Oxford",
          concept: "Trang trọng cổ điển kết hợp phong cách học đường đương đại cho lễ tốt nghiệp tại Văn Miếu.",
          garmentType: "ao_tac",
          colorPalette: {
            primary: "#38BDF8",
            secondary: "#FAF9F5",
            accent: "#0F172A"
          },
          etiquetteNotes: "Áo Tấc cài khuy Hữu nhiệm, đi kèm quần lụa trắng và khăn vấn chuẩn phong nghi triều Nguyễn."
        });

        setPassiveEtiquetteToast({
          show: true,
          message: "Đã khoác trọn bộ Kỷ Yếu Văn Miếu (Áo Tấc + Quần lụa trắng + Khăn vấn đen + Giày Oxford)!"
        });
      }, 400);
      return;
    }

    // Kịch bản 6.2: Inappropriate / Disrespectful request guard
    if (query.toLowerCase().includes('đi bar') || query.toLowerCase().includes('quẩy') || query.toLowerCase().includes('ban đêm')) {
      setTimeout(() => {
        setIsAiLoading(false);
        setAiRecommendation({
          outfitTitle: "Gợi Ý Phối Đồ Dạ Tiệc Tối Cổ Phong",
          concept: "Áo Nhật Bình là triều phục cung đình trang nghiêm. Nếu bạn muốn đi tiệc tối cá tính, hãy thử Áo Ngũ Thân tay chẽn phối cùng chân váy midi và boots hiện đại để vừa năng động vừa giữ gìn sự tôn nghiêm.",
          garmentType: "ao_ngu_than_chen",
          colorPalette: {
            primary: "#18181B",
            secondary: "#991B1B",
            accent: "#D97706"
          },
          etiquetteNotes: "Áo Ngũ Thân Tay Chẽn dạ tiệc tối năng động, giữ gìn nét tôn nghiêm di sản Việt."
        });
      }, 400);
      return;
    }

    try {
      const res = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          occasion: 'yearbook_graduation',
          gender: mannequin.genderPresentation
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiRecommendation(data.data);
      } else {
        throw new Error('API failed');
      }
    } catch {
      // Fallback AI recommendation
      setAiRecommendation({
        outfitTitle: "Áo Tấc Thủy Lam x Sneaker Trắng Tối Giản",
        concept: "Sự thanh lịch trang nghiêm của Cố đô kết hợp bước chân năng động dạo quanh phố cổ.",
        garmentType: "ao_tac",
        colorPalette: {
          primary: "#1E3A8A",
          secondary: "#0F172A",
          accent: "#D97706"
        },
        etiquetteNotes: "Giữ khuy Hữu nhiệm và khoanh tay nhẹ khi chụp ảnh kỷ yếu trang nghiêm."
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply AI Recommendation
  const handleApplyAiRecommendation = useCallback(() => {
    if (!aiRecommendation) return;
    const target = isSplitMode && activeTarget === 'B' ? 'B' : 'A';
    const base = isSplitMode && activeTarget === 'B' ? outfitB : currentLayers;
    const targetFamily = (aiRecommendation.garmentType as GarmentFamily) || 'ao_tac';
    const targetLore = GARMENTS_LORE.find(g => g.family === targetFamily);

    const next: GarmentLayerState = {
      ...base,
      layer3_outer: {
        ...base.layer3_outer,
        family: targetFamily,
        name: targetLore?.name || 'Áo Tấc',
        robeColor: aiRecommendation.colorPalette?.primary || '#1E3A8A',
        collarColor: '#FAF9F5',
        trimColor: aiRecommendation.colorPalette?.accent || '#D97706',
        lapelDirection: 'right_over_left'
      },
      layer5_modernAccessory: {
        ...base.layer5_modernAccessory,
        footwearId: 'chunky_sneakers',
        footwearName: 'Chunky Sneakers Trắng'
      }
    };

    updateLayers(next, target);
  }, [aiRecommendation, currentLayers, outfitB, isSplitMode, activeTarget, updateLayers]);

  // Open Save Outfit Naming Modal
  const handleSaveOutfit = useCallback(() => {
    const outerName = currentLayers.layer3_outer.name || 'Cổ Phục Việt';
    setCustomOutfitTitle(`${outerName} Remix`);
    setCustomOutfitConcept(`Bộ phối ${outerName} hài hòa giữa di sản truyền thống và phong cách Gen Z đương đại.`);
    setCustomOccasion('yearbook_graduation');
    setIsSaveModalOpen(true);
  }, [currentLayers]);

  // Submit Save Outfit with Custom Title & Concept
  const handleConfirmSaveOutfit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalTitle = customOutfitTitle.trim() || `${currentLayers.layer3_outer.name || 'Cổ Phục'} Remix`;
    const finalConcept = customOutfitConcept.trim() || `Bộ phối ${finalTitle} mang hơi thở văn hóa Việt Nam.`;

    const newOutfit: SavedOutfit = {
      id: `outfit_${Date.now()}`,
      title: finalTitle,
      concept: finalConcept,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      occasion: customOccasion,
      layers: currentLayers,
      mannequin,
      fiveElementHarmony: {
        element: 'Thủy',
        score: auditResult.score,
        explanation: 'Sắc độ tự nhiên tuân thủ nguyên lý tương sinh ngũ hành.'
      },
      etiquetteScore: auditResult.score,
      likesCount: 1
    };

    onSaveOutfit(newOutfit);
    setIsSaveModalOpen(false);
    setIsSavedToastOpen(true);
    setTimeout(() => setIsSavedToastOpen(false), 3000);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-4rem)] max-w-full overflow-hidden bg-[#121212] select-none relative">
      {/* =========================================================================
          DESKTOP WORKSTATION LAYOUT (>= 1024px)
          Ergonomic 3-Column Studio: Left Wardrobe (320px) | Center Canvas (flex-1) | Right AI (300px)
         ========================================================================= */}
      <div className="hidden lg:flex flex-1 overflow-hidden relative">
        {/* LEFT PANEL: Compact Drawer */}
        <div className="w-80 shrink-0 h-full border-r border-stone-800/80 bg-[#161616] flex flex-col">
          <WardrobeLayerDrawer
            currentLayers={activeTargetLayers}
            dynamicLayers={currentDynamicLayers}
            mannequin={mannequin}
            onUpdateMannequin={handleUpdateMannequin}
            onEquipItem={handleEquipItem}
            onToggleLayerVisibility={handleToggleLayerVisibility}
            onRemoveLayer={handleRemoveLayer}
            onMoveLayer={handleMoveLayer}
            onSelectLayer={setSelectedLayerId}
            selectedLayerId={selectedLayerId}
            onUpdateOuterColor={handleUpdateOuterColor}
          />
        </div>

        {/* CENTER PANEL: Focused Styling Canvas */}
        <div className="flex-1 h-full relative flex flex-col">
          <MannequinCanvas
            currentLayers={currentLayers}
            mannequin={mannequin}
            onUpdateMannequin={handleUpdateMannequin}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayerTransform={handleUpdateLayerTransform}
            onRemoveLayer={handleRemoveLayer}
            onToggleLayerLock={handleToggleLayerLock}
            onToggleLayerVisibility={handleToggleLayerVisibility}
            onLapelToggle={handleToggleLapel}
            onDropItem={handleEquipItem}
            enableAiFusion={enableAiFusion}
            onToggleAiFusion={handleToggleAiFusion}
            canUndo={history.length > 0}
            canRedo={future.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleResetCanvas}
            isSplitMode={isSplitMode}
            onToggleSplitMode={() => setIsSplitMode(!isSplitMode)}
            outfitB={outfitB}
            activeTarget={activeTarget}
            onSetActiveTarget={setActiveTarget}
            onCloneAToB={handleCloneAToB}
            onSelectWinnerB={handleSelectWinnerB}
            onSaveOutfit={handleSaveOutfit}
          />
        </div>

        {/* RIGHT PANEL: Intelligent Cultural Companion */}
        <div className="w-[300px] shrink-0 h-full border-l border-stone-800/80 bg-[#161616] flex flex-col">
          <CulturalAIPanel
            auditResult={auditResult}
            onAutoFix={handleAutoFix}
            onAskAiStylist={handleAskAiStylist}
            isAiLoading={isAiLoading}
            aiRecommendation={aiRecommendation}
            onApplyAiRecommendation={handleApplyAiRecommendation}
          />
        </div>
      </div>

      {/* =========================================================================
          TABLET PORTRAIT WORKSTATION LAYOUT (768px - 1024px)
          Upper 62%: Anchored Mannequin Canvas | Lower 38%: Fixed Wardrobe Drawer Grid
         ========================================================================= */}
      <div className="hidden md:flex lg:hidden flex-1 flex-col overflow-hidden relative">
        {/* Upper 62% Height: Live Mannequin Canvas */}
        <div className="h-[62%] relative flex flex-col border-b border-stone-800/80">
          <MannequinCanvas
            currentLayers={currentLayers}
            mannequin={mannequin}
            onUpdateMannequin={handleUpdateMannequin}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayerTransform={handleUpdateLayerTransform}
            onRemoveLayer={handleRemoveLayer}
            onToggleLayerLock={handleToggleLayerLock}
            onToggleLayerVisibility={handleToggleLayerVisibility}
            onLapelToggle={handleToggleLapel}
            onDropItem={handleEquipItem}
            enableAiFusion={enableAiFusion}
            onToggleAiFusion={handleToggleAiFusion}
            canUndo={history.length > 0}
            canRedo={future.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleResetCanvas}
            isSplitMode={isSplitMode}
            onToggleSplitMode={() => setIsSplitMode(!isSplitMode)}
            outfitB={outfitB}
            activeTarget={activeTarget}
            onSetActiveTarget={setActiveTarget}
            onCloneAToB={handleCloneAToB}
            onSelectWinnerB={handleSelectWinnerB}
            onSaveOutfit={handleSaveOutfit}
          />
        </div>

        {/* Lower 38% Height: Fixed Multi-Row Wardrobe Drawer */}
        <div className="h-[38%] overflow-y-auto bg-[#161616] flex flex-col">
          <WardrobeLayerDrawer
            currentLayers={activeTargetLayers}
            dynamicLayers={currentDynamicLayers}
            mannequin={mannequin}
            onUpdateMannequin={handleUpdateMannequin}
            onEquipItem={handleEquipItem}
            onToggleLayerVisibility={handleToggleLayerVisibility}
            onRemoveLayer={handleRemoveLayer}
            onMoveLayer={handleMoveLayer}
            onSelectLayer={setSelectedLayerId}
            selectedLayerId={selectedLayerId}
            onUpdateOuterColor={handleUpdateOuterColor}
          />
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEWPORT LAYOUT (< 768px)
          Permanently Anchored Mannequin Canvas + Interactive Peeking Bottom Sheet + AI FAB
         ========================================================================= */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden relative">
        {/* CENTER: Permanently Anchored Live Mannequin Canvas */}
        <div className="flex-1 w-full h-full relative pb-28">
          <MannequinCanvas
            currentLayers={currentLayers}
            mannequin={mannequin}
            onUpdateMannequin={handleUpdateMannequin}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayerTransform={handleUpdateLayerTransform}
            onRemoveLayer={handleRemoveLayer}
            onToggleLayerLock={handleToggleLayerLock}
            onToggleLayerVisibility={handleToggleLayerVisibility}
            onLapelToggle={handleToggleLapel}
            onDropItem={handleEquipItem}
            enableAiFusion={enableAiFusion}
            onToggleAiFusion={handleToggleAiFusion}
            canUndo={history.length > 0}
            canRedo={future.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleResetCanvas}
            isSplitMode={isSplitMode}
            onToggleSplitMode={() => setIsSplitMode(!isSplitMode)}
            outfitB={outfitB}
            activeTarget={activeTarget}
            onSetActiveTarget={setActiveTarget}
            onCloneAToB={handleCloneAToB}
            onSelectWinnerB={handleSelectWinnerB}
            onSaveOutfit={handleSaveOutfit}
          />
        </div>

        {/* ERGONOMIC 3-SNAP-POINT DRAGGABLE BOTTOM SHEET FOR MOBILE ONLY (md:hidden) */}
        <div 
          className={`md:hidden fixed bottom-14 inset-x-0 bg-[#161616]/98 border-t border-amber-900/60 shadow-[0_-8px_30px_rgba(0,0,0,0.9)] backdrop-blur-2xl z-40 flex flex-col transition-all duration-300 ${
            bottomSheetStage === 'collapsed'
              ? 'h-[20dvh]'
              : bottomSheetStage === 'half'
                ? 'h-[50dvh]'
                : 'h-[90dvh]'
          }`}
        >
          {/* Draggable Handle Bar with Snap Point Cue */}
          <div 
            onClick={() => setBottomSheetStage(prev => prev === 'collapsed' ? 'half' : prev === 'half' ? 'full' : 'collapsed')}
            className="h-10 px-4 bg-[#1c1c1c] border-b border-stone-800 flex items-center justify-between shrink-0 cursor-pointer active:bg-stone-800/80 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-stone-200">
              <div className="w-8 h-1 bg-[#D4AF37] rounded-full" />
              <span className="font-serif uppercase tracking-wider text-[11px] text-[#D4AF37]">Tủ Đồ 5 Lớp</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-medium">
              <span className={bottomSheetStage === 'collapsed' ? 'text-amber-400 font-bold' : ''}>Thu gọn (20%)</span>
              <span>·</span>
              <span className={bottomSheetStage === 'half' ? 'text-amber-400 font-bold' : ''}>Nửa màn hình (50%)</span>
              <span>·</span>
              <span className={bottomSheetStage === 'full' ? 'text-amber-400 font-bold' : ''}>Toàn màn hình (90%)</span>
            </div>
          </div>

          {/* Category Tabs Bar */}
          <div className="px-3 py-1.5 bg-[#181818] border-b border-stone-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {(['all', 'outer', 'inner', 'bottom', 'acc'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setMobileQuickCategory(cat);
                  if (bottomSheetStage === 'collapsed') setBottomSheetStage('half');
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all cursor-pointer ${
                  mobileQuickCategory === cat
                    ? 'bg-[#8B0000] text-white border border-red-600'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                {cat === 'all' && 'Tất cả'}
                {cat === 'outer' && 'Áo ngoài'}
                {cat === 'inner' && 'Yếm lót'}
                {cat === 'bottom' && 'Hạ y'}
                {cat === 'acc' && 'Phụ kiện'}
              </button>
            ))}
          </div>

          {/* Collapsed Mode: Quick 1-Row Suggestion Swiper */}
          {bottomSheetStage === 'collapsed' ? (
            <div className="px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {quickWardrobeItems.map((item: any) => {
                const isSelected = 
                  (item.category === 'outer' && currentLayers.layer3_outer.family === item.id) ||
                  (item.category === 'inner' && currentLayers.layer1_inner.id === item.id) ||
                  (item.category === 'bottom' && currentLayers.layer2_bottom.id === item.id);

                return (
                  <button
                    key={`${item.category}_${item.id}`}
                    type="button"
                    onClick={() => handleEquipItem(item)}
                    className={`min-w-[95px] h-9 px-2.5 rounded-xl border flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#221c1a] border-[#D4AF37] text-white font-bold shadow-md'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: item.color || '#D4AF37' }} />
                    <span className="text-[10px] truncate">{item.name}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setBottomSheetStage('half')}
                className="px-3 py-1.5 rounded-xl bg-amber-900/80 border border-amber-600 text-amber-200 text-[10px] font-bold shrink-0 cursor-pointer hover:bg-amber-800"
              >
                Mở Rộng Tủ Đồ ➔
              </button>
            </div>
          ) : (
            /* Half (50%) and Full (90%) Modes: Full Wardrobe & Layer Management Drawer */
            <div className="flex-1 overflow-y-auto">
              <WardrobeLayerDrawer
                currentLayers={activeTargetLayers}
                dynamicLayers={currentDynamicLayers}
                mannequin={mannequin}
                onUpdateMannequin={handleUpdateMannequin}
                onEquipItem={handleEquipItem}
                onToggleLayerVisibility={handleToggleLayerVisibility}
                onRemoveLayer={handleRemoveLayer}
                onMoveLayer={handleMoveLayer}
                onSelectLayer={setSelectedLayerId}
                selectedLayerId={selectedLayerId}
                onUpdateOuterColor={handleUpdateOuterColor}
              />
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          FLOATING ACTION BUTTON (FAB) FOR AI COMPANION (Visible on < lg screens)
         ========================================================================= */}
      <button
        type="button"
        onClick={() => setIsAiDrawerOpen(true)}
        className="md:hidden fixed bottom-28 right-4 sm:right-6 z-40 min-h-[44px] px-3.5 py-2.5 rounded-full bg-gradient-to-r from-[#8B0000] to-[#B91C1C] hover:from-[#A00000] hover:to-[#D93829] border border-amber-500/60 text-white shadow-2xl shadow-red-950/80 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
        aria-label="Mở Cố Vấn AI & Thẩm Định Điển Tích"
      >
        <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
        <span className="text-xs font-bold font-serif hidden xs:inline">Cố Vấn AI</span>
        <span 
          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            auditResult.score >= 90 
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
          }`}
        >
          {auditResult.score}%
        </span>
      </button>

      {/* =========================================================================
          AI STYLIST MODAL SLIDE-OVER DRAWER (Visible when isAiDrawerOpen on mobile)
         ========================================================================= */}
      {isAiDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop click to dismiss */}
          <div className="flex-1" onClick={() => setIsAiDrawerOpen(false)} />

          <div className="w-full sm:max-w-md max-w-full h-full bg-[#161616] border-l border-stone-800 shadow-2xl flex flex-col overflow-hidden animate-slideLeft">
            {/* Top Close Bar */}
            <div className="h-13 px-4 border-b border-stone-800 flex items-center justify-between shrink-0 bg-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white font-serif uppercase tracking-wider">
                  Cố Vấn AI & Điển Tích
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAiDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Đóng bảng cố vấn AI"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Cultural AI Panel */}
            <div className="flex-1 overflow-y-auto">
              <CulturalAIPanel
                auditResult={auditResult}
                onAutoFix={handleAutoFix}
                onAskAiStylist={handleAskAiStylist}
                isAiLoading={isAiLoading}
                aiRecommendation={aiRecommendation}
                onApplyAiRecommendation={() => {
                  handleApplyAiRecommendation();
                  setIsAiDrawerOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* PILL BADGE ON CANVAS CORNER: Clean non-intrusive warning pill (Anchored top-right, zero collision) */}
      {auditResult.issues.length > 0 && (
        <div className="fixed top-16 sm:top-20 right-3 sm:right-6 z-[35] max-w-[calc(100vw-2rem)] pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsEtiquetteDetailSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#241a10]/95 border border-amber-500/80 shadow-2xl text-amber-200 text-xs font-semibold backdrop-blur-md hover:bg-amber-900/90 transition-all cursor-pointer active:scale-95 max-w-full"
          >
            <span className="text-amber-400 shrink-0">⚠️</span>
            <span className="truncate text-[11px] sm:text-xs">
              {auditResult.issues[0].title}
            </span>
            <span className="shrink-0 bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full text-[10px] font-bold">
              Sửa
            </span>
          </button>
        </div>
      )}

      {/* CULTURAL ETIQUETTE BOTTOM SHEET: Detailed explanation sheet when pill is tapped */}
      {isEtiquetteDetailSheetOpen && auditResult.issues.length > 0 && (
        <div 
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsEtiquetteDetailSheetOpen(false)}
        >
          <div 
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))' }}
            className="w-full max-w-lg bg-[#181818] border-t border-amber-600/60 rounded-t-3xl p-5 shadow-2xl space-y-4 text-stone-200 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-amber-200 font-serif">Chi Tiết Cảnh Báo Văn Hóa</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEtiquetteDetailSheetOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-400 hover:text-white rounded-xl bg-stone-800/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Đóng chi tiết cảnh báo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[55vh] overflow-y-auto no-scrollbar">
              {auditResult.issues.map((issue, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-300">{issue.title}</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">{issue.description}</p>
                  <p className="text-xs font-medium text-emerald-400 flex items-center gap-1 mt-1">
                    <span>💡 Gợi ý giải quyết:</span> {issue.solution}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => {
                  handleAutoFix();
                  setIsEtiquetteDetailSheetOpen(false);
                }}
                className="min-h-[44px] flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                ⚡ Sửa Tự Động Ngay
              </button>
              <button
                type="button"
                onClick={() => setIsEtiquetteDetailSheetOpen(false)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-xs transition-all cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNDO TOAST FOR DEFENSIVE DELETION */}
      {pendingDeleteLayer && (
        <UndoToast
          message={`Đã gỡ bỏ "${pendingDeleteLayer.layer.name}" khỏi mannequin`}
          onUndo={handleUndoDeleteLayer}
          onDismiss={() => setPendingDeleteLayer(null)}
        />
      )}

      {/* DISCREET SAVED TOAST */}
      {isSavedToastOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c1c1c] border border-[#D4AF37]/60 shadow-2xl text-stone-100 text-xs backdrop-blur-md animate-fadeIn">
          <BookmarkCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Đã lưu bộ phối vào Lookbook cá nhân!</span>
        </div>
      )}

      {/* SAVE OUTFIT MODAL (Custom Naming & Concept) */}
      {isSaveModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSaveModalOpen(false);
          }}
        >
          <div className="w-full max-w-md max-w-[calc(100vw-1.5rem)] bg-[#181818] border border-stone-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 text-stone-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#8B0000] flex items-center justify-center">
                  <BookmarkCheck className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <h3 className="text-sm font-semibold text-white font-serif">Lưu Bộ Phối Vào Lookbook</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                aria-label="Đóng bảng lưu bộ phối"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSaveOutfit} className="space-y-3.5">
              {/* Outfit Title Input */}
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Tên bộ trang phục <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customOutfitTitle}
                  onChange={(e) => setCustomOutfitTitle(e.target.value)}
                  placeholder="Ví dụ: Áo Tấc Thủy Lam x Chunky Sneakers"
                  className="w-full bg-[#101010] border border-stone-700/80 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 outline-none transition-all"
                />
              </div>

              {/* Concept & Story Textarea */}
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Ý tưởng & Cảm hứng phối đồ
                </label>
                <textarea
                  rows={3}
                  value={customOutfitConcept}
                  onChange={(e) => setCustomOutfitConcept(e.target.value)}
                  placeholder="Mô tả bối cảnh, ý nghĩa màu sắc hoặc thông điệp văn hóa..."
                  className="w-full bg-[#101010] border border-stone-700/80 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Occasion Context Select */}
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Dịp / Bối cảnh phù hợp
                </label>
                <select
                  value={customOccasion}
                  onChange={(e) => setCustomOccasion(e.target.value as OccasionContext)}
                  className="w-full bg-[#101010] border border-stone-700/80 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                >
                  <option value="yearbook_graduation">Chụp kỷ yếu / Lễ tốt nghiệp</option>
                  <option value="streetwear_cafe">Dạo phố cà phê / Streetwear Gen Z</option>
                  <option value="gala_formal">Dạ tiệc trang trọng / Sự kiện ngoại giao</option>
                  <option value="lunar_new_year">Tết Nguyên Đán & Du xuân</option>
                  <option value="folk_festival">Lễ hội văn hóa truyền thống</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#8B0000] to-[#C0392B] hover:from-[#A00000] hover:to-[#D93829] shadow-md shadow-red-950/40 border border-red-700/50 transition-all cursor-pointer active:scale-95"
                >
                  Lưu Vào Lookbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
