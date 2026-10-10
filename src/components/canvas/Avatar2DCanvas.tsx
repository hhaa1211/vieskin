import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Wand2, 
  RefreshCw,
  X,
  Hand
} from 'lucide-react';
import { GarmentLayerState, MannequinSettings, DynamicLayerItem } from '../../types';

interface Avatar2DCanvasProps {
  layers: GarmentLayerState;
  mannequin: MannequinSettings;
  className?: string;
  showControls?: boolean;
  onLapelToggle?: () => void;
  readOnly?: boolean;
  draggedItemType?: string | null;
  onItemDrop?: (item: any) => void;
  isActiveCanvas?: boolean;
  onCanvasClick?: () => void;
  label?: string;
  selectedLayerId?: string | null;
  onSelectLayer?: (layerId: string | null) => void;
  onUpdateLayerTransform?: (layerId: string, transform: { x: number; y: number; scale: number; rotation: number }) => void;
  onRemoveLayer?: (layerId: string) => void;
  onToggleLayerLock?: (layerId: string) => void;
  onToggleLayerVisibility?: (layerId: string) => void;
  enableAiFusion?: boolean;
  onToggleAiFusion?: () => void;
}

export const Avatar2DCanvas: React.FC<Avatar2DCanvasProps> = ({
  layers,
  mannequin,
  className = '',
  showControls = false,
  onLapelToggle,
  readOnly = false,
  draggedItemType = null,
  onItemDrop,
  isActiveCanvas = true,
  onCanvasClick,
  label,
  selectedLayerId = null,
  onSelectLayer,
  onUpdateLayerTransform,
  onRemoveLayer,
  onToggleLayerLock,
  onToggleLayerVisibility,
  enableAiFusion = true,
  onToggleAiFusion
}) => {
  const { skinTone, bodyProportion, faceImageUri, heightScale } = mannequin;
  const { layer1_inner, layer2_bottom, layer3_outer, layer4_tradAccessory, layer5_modernAccessory, dynamicLayers } = layers;

  const [isDragOver, setIsDragOver] = useState(false);
  const [snappedFeedback, setSnappedFeedback] = useState<string | null>(null);

  // Dragging bounding box interaction state
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const dragStartClientPos = useRef<{ clientX: number; clientY: number } | null>(null);
  const dragStartTransformPos = useRef<{ x: number; y: number; scale?: number; rotation?: number } | null>(null);
  const draggingLayerId = useRef<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Body width modifier based on proportion
  const widthRatio = bodyProportion === 'slim' ? 0.92 : bodyProportion === 'athletic' ? 1.08 : 1.0;
  const isRightOverLeft = layer3_outer.lapelDirection === 'right_over_left'; // Chuẩn mực Hữu nhiệm

  // Synchronized list of interactive layers (Outer Robe, Inner Yếm, Bottoms, Headwear, Jewelry, Eyewear, Bags, Props)
  const interactiveAccessoryLayers = useMemo(() => {
    const list: DynamicLayerItem[] = [];
    const dyn = dynamicLayers || [];
    const findLayer = (id: string) => dyn.find(l => l.id === id);

    // 0a. Outer Robe (if equipped)
    if (layer3_outer.robeColor && layer3_outer.robeColor !== 'transparent' && layer3_outer.name && layer3_outer.name !== 'Chưa khoác áo ngoài') {
      const existing = findLayer('layer_outer');
      list.push({
        id: 'layer_outer',
        category: 'outer',
        name: layer3_outer.name || 'Áo khoác ngoài',
        color: layer3_outer.robeColor,
        visible: existing ? existing.visible : true,
        locked: existing?.locked || false,
        transform: existing?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // 0b. Inner Yếm (if equipped)
    if (layer1_inner.visible && layer1_inner.color && layer1_inner.color !== 'transparent' && layer1_inner.name && layer1_inner.name !== 'Chưa mặc yếm') {
      const existing = findLayer('layer_inner');
      list.push({
        id: 'layer_inner',
        category: 'inner',
        name: layer1_inner.name || 'Yếm đào',
        color: layer1_inner.color,
        visible: existing ? existing.visible : (layer1_inner.visible ?? true),
        locked: existing?.locked || false,
        transform: existing?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // 0c. Bottoms (if equipped)
    if (layer2_bottom.color && layer2_bottom.color !== 'transparent' && layer2_bottom.name && layer2_bottom.name !== 'Chưa mặc hạ y') {
      const existing = findLayer('layer_bottom');
      list.push({
        id: 'layer_bottom',
        category: 'bottom',
        name: layer2_bottom.name || 'Hạ y / Quần',
        color: layer2_bottom.color,
        visible: existing ? existing.visible : true,
        locked: existing?.locked || false,
        transform: existing?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // 1. Headwear (Khăn Vấn, Nón Quai Thao, Nón Lá)
    if (layer4_tradAccessory.headwearId) {
      const existing = findLayer('layer_headwear') || dyn.find(l => l.category === 'trad_accessory' && (l.type?.includes('khan') || l.type?.includes('non')));
      list.push({
        id: existing?.id || 'layer_headwear',
        category: 'trad_accessory',
        name: existing?.name || layer4_tradAccessory.headwearName || 'Khăn Vấn',
        type: existing?.type || layer4_tradAccessory.headwearId,
        color: existing?.color || layer4_tradAccessory.headwearColor || '#0F172A',
        visible: existing ? existing.visible : true,
        locked: existing ? existing.locked : false,
        transform: existing?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // 2. Jewelry (Chuỗi Ngọc Bích, Kim Khánh & Thẻ Bài)
    if (layer4_tradAccessory.jewelryId) {
      const existing = findLayer('layer_jewelry') || dyn.find(l => l.category === 'trad_accessory' && (l.type?.includes('chuoi') || l.type?.includes('kim_khanh') || l.type?.includes('the_bai')));
      list.push({
        id: existing?.id || 'layer_jewelry',
        category: 'trad_accessory',
        name: existing?.name || layer4_tradAccessory.jewelryName || 'Trang sức cổ truyền',
        type: existing?.type || layer4_tradAccessory.jewelryId,
        color: existing?.color || '#059669',
        visible: existing ? existing.visible : true,
        locked: existing ? existing.locked : false,
        transform: existing?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // 3. Eyewear (Kính Râm Oval Retro, Kính Mắt)
    if (layer5_modernAccessory.eyewearId) {
      const existing = findLayer('layer_eyewear') || dyn.find(l => l.category === 'modern_accessory' && l.type?.includes('kinh'));
      list.push({
        id: existing?.id || 'layer_eyewear',
        category: 'modern_accessory',
        name: existing?.name || layer5_modernAccessory.eyewearName || 'Kính Râm Retro',
        type: existing?.type || layer5_modernAccessory.eyewearId,
        visible: existing ? existing.visible : true,
        locked: existing ? existing.locked : false,
        transform: existing?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // 4. Bags (Canvas Tote, Baguette Bag, Túi Gấm)
    if (layer5_modernAccessory.bagId) {
      const existing = findLayer('layer_bag') || dyn.find(l => l.category === 'modern_accessory' && (l.type?.includes('tote') || l.type?.includes('baguette') || l.type?.includes('tui')));
      list.push({
        id: existing?.id || 'layer_bag',
        category: 'modern_accessory',
        name: existing?.name || layer5_modernAccessory.bagName || 'Túi xách',
        type: existing?.type || layer5_modernAccessory.bagId,
        visible: existing ? existing.visible : true,
        locked: existing ? existing.locked : false,
        transform: existing?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // 5. Footwear (Chunky Sneakers, Chelsea Boots, Hài Thêu)
    if (layer5_modernAccessory.footwearId || layer4_tradAccessory.footwearId) {
      const footwearId = layer5_modernAccessory.footwearId || layer4_tradAccessory.footwearId;
      const footwearName = layer5_modernAccessory.footwearName || layer4_tradAccessory.footwearName || 'Giày Dép';
      const existing = findLayer('layer_footwear') || dyn.find(l => l.category === 'modern_accessory' && (l.type?.includes('sneaker') || l.type?.includes('boot') || l.type?.includes('hai') || l.id.includes('footwear')));
      list.push({
        id: existing?.id || 'layer_footwear',
        category: 'modern_accessory',
        name: existing?.name || footwearName,
        type: existing?.type || footwearId,
        visible: existing ? existing.visible : true,
        locked: existing ? existing.locked : false,
        transform: existing?.transform || { x: 0, y: 0, scale: 1, rotation: 0 }
      });
    }

    // 6. Custom Props from Library or Direct Additions
    dyn.forEach(l => {
      if (!list.some(item => item.id === l.id)) {
        list.push(l);
      }
    });

    return list;
  }, [dynamicLayers, layer1_inner, layer2_bottom, layer3_outer, layer4_tradAccessory, layer5_modernAccessory]);

  // Keyboard shortcut listener to delete selected layer directly with Delete / Backspace key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId && onRemoveLayer) {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
        onRemoveLayer(selectedLayerId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, onRemoveLayer]);

  // Find currently selected layer item (if any)
  const activeSelectedLayer = interactiveAccessoryLayers.find(l => l.id === selectedLayerId) || null;

  // Transform states & visibility for core garments
  const isInnerVisible = interactiveAccessoryLayers.find(l => l.id === 'layer_inner')?.visible ?? (layer1_inner.visible ?? true);
  const innerTransform = interactiveAccessoryLayers.find(l => l.id === 'layer_inner')?.transform || { x: 0, y: 0, scale: 1, rotation: 0 };
  const isInnerSelected = selectedLayerId === 'layer_inner';
  const isInnerDragging = isDraggingItem && draggingLayerId.current === 'layer_inner';

  const isBottomVisible = interactiveAccessoryLayers.find(l => l.id === 'layer_bottom')?.visible ?? true;
  const bottomTransform = interactiveAccessoryLayers.find(l => l.id === 'layer_bottom')?.transform || { x: 0, y: 0, scale: 1, rotation: 0 };
  const isBottomSelected = selectedLayerId === 'layer_bottom';
  const isBottomDragging = isDraggingItem && draggingLayerId.current === 'layer_bottom';

  const isOuterVisible = interactiveAccessoryLayers.find(l => l.id === 'layer_outer')?.visible ?? true;
  const outerTransform = interactiveAccessoryLayers.find(l => l.id === 'layer_outer')?.transform || { x: 0, y: 0, scale: 1, rotation: 0 };
  const isOuterSelected = selectedLayerId === 'layer_outer';
  const isOuterDragging = isDraggingItem && draggingLayerId.current === 'layer_outer';

  // Swipe / Gesture drag event handlers for direct moving of accessories
  const startDragGesture = (layerId: string, clientX: number, clientY: number) => {
    if (readOnly || !onUpdateLayerTransform) return;
    const targetLayer = interactiveAccessoryLayers.find(l => l.id === layerId);
    if (!targetLayer || targetLayer.locked) return;

    if (selectedLayerId !== layerId && onSelectLayer) {
      onSelectLayer(layerId);
    }

    draggingLayerId.current = layerId;
    dragStartClientPos.current = { clientX, clientY };
    dragStartTransformPos.current = {
      x: targetLayer.transform?.x || 0,
      y: targetLayer.transform?.y || 0,
      scale: targetLayer.transform?.scale || 1,
      rotation: targetLayer.transform?.rotation || 0
    };
    setIsDraggingItem(true);
  };

  const handleItemPointerDown = (e: React.PointerEvent, layerId: string) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    startDragGesture(layerId, e.clientX, e.clientY);
  };

  const handleItemTouchStart = (e: React.TouchEvent, layerId: string) => {
    if (readOnly || e.touches.length !== 1) return;
    e.stopPropagation();
    const touch = e.touches[0];
    startDragGesture(layerId, touch.clientX, touch.clientY);
  };

  // Global window listeners while dragging for silky smooth swipe across the canvas
  useEffect(() => {
    if (!isDraggingItem) return;

    const onPointerMove = (e: MouseEvent | TouchEvent | PointerEvent) => {
      if (!draggingLayerId.current || !dragStartClientPos.current || !dragStartTransformPos.current) return;
      if (!onUpdateLayerTransform) return;

      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }

      // Calculate scale factor between SVG viewBox (400x560) and rendered screen width
      let svgScale = 1;
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          svgScale = 400 / rect.width;
        }
      }

      const deltaX = (clientX - dragStartClientPos.current.clientX) * svgScale;
      const deltaY = (clientY - dragStartClientPos.current.clientY) * svgScale;

      const layer = interactiveAccessoryLayers.find(l => l.id === draggingLayerId.current);
      if (!layer) return;

      const newX = Math.round((dragStartTransformPos.current.x + deltaX) * 10) / 10;
      const newY = Math.round((dragStartTransformPos.current.y + deltaY) * 10) / 10;

      onUpdateLayerTransform(draggingLayerId.current, {
        x: newX,
        y: newY,
        scale: (dragStartTransformPos.current as any).scale ?? 1,
        rotation: (dragStartTransformPos.current as any).rotation ?? 0
      });
    };

    const onPointerUp = () => {
      if (draggingLayerId.current && onUpdateLayerTransform) {
        const draggedLayer = interactiveAccessoryLayers.find(l => l.id === draggingLayerId.current);
        if (draggedLayer && draggedLayer.transform) {
          const { x = 0, y = 0 } = draggedLayer.transform;
          if (Math.abs(x) > 65 || Math.abs(y) > 75) {
            // Auto snap back to anchor position (Kịch bản 5.2)
            onUpdateLayerTransform(draggingLayerId.current, { x: 0, y: 0, scale: 1, rotation: 0 });
            setSnappedFeedback(`Đã hít (snap) ${draggedLayer.name} về vị trí quy chuẩn`);
            setTimeout(() => setSnappedFeedback(null), 2800);
          }
        }
      }
      setIsDraggingItem(false);
      draggingLayerId.current = null;
      dragStartClientPos.current = null;
      dragStartTransformPos.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault(); // Stop mobile browser scrolling while dragging accessory
        onPointerMove(e);
      }
    };

    window.addEventListener('pointermove', onPointerMove as any, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove as any);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('touchcancel', onPointerUp);
    };
  }, [isDraggingItem, interactiveAccessoryLayers, onUpdateLayerTransform]);

  // Drag & drop handlers from left panel onto canvas
  const handleDragOver = (e: React.DragEvent) => {
    if (readOnly || !onItemDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (readOnly || !onItemDrop) return;
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const item = JSON.parse(dataStr);
        onItemDrop(item);
        setSnappedFeedback(item.name || 'Món đồ');
        setTimeout(() => setSnappedFeedback(null), 2400);
      }
    } catch (err) {
      console.warn('Drop parsing failed:', err);
    }
  };

  // Nudge / transform helper for active selected layer
  const modifyTransform = (delta: { x?: number; y?: number; scale?: number; rotation?: number }) => {
    if (!activeSelectedLayer || !onUpdateLayerTransform || activeSelectedLayer.locked) return;
    const current = activeSelectedLayer.transform || { x: 0, y: 0, scale: 1, rotation: 0 };
    const nextTransform = {
      x: Math.round((current.x + (delta.x || 0)) * 10) / 10,
      y: Math.round((current.y + (delta.y || 0)) * 10) / 10,
      scale: Math.max(0.4, Math.min(2.5, Math.round(((current.scale || 1) + (delta.scale || 0)) * 10) / 10)),
      rotation: Math.round((current.rotation + (delta.rotation || 0)) % 360)
    };
    onUpdateLayerTransform(activeSelectedLayer.id, nextTransform);
  };

  const resetTransform = () => {
    if (!activeSelectedLayer || !onUpdateLayerTransform) return;
    onUpdateLayerTransform(activeSelectedLayer.id, { x: 0, y: 0, scale: 1, rotation: 0 });
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      onClick={onCanvasClick}
    >
      {/* Visual Canvas Frame */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full aspect-[3/4] max-w-[420px] shrink-0 rounded-2xl bg-gradient-to-b from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-950 p-2 shadow-inner overflow-hidden flex items-center justify-center transition-all ${
          isActiveCanvas 
            ? 'ring-2 ring-rose-500/80 border-transparent shadow-md' 
            : 'border border-stone-200 dark:border-stone-800 opacity-95'
        } ${isDragOver ? 'ring-4 ring-amber-400 bg-amber-50/20 dark:bg-amber-950/20 scale-[1.01]' : ''}`}
      >
        
        {/* Subtle Heritage Background Watermark Graphic (Ngũ Hành / Trống Đồng geometry) */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" 
          viewBox="0 0 400 500" 
          fill="none" 
          stroke="currentColor"
        >
          <circle cx="200" cy="250" r="140" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="200" cy="250" r="90" strokeWidth="1" />
          <circle cx="200" cy="250" r="40" strokeWidth="0.8" />
          <path d="M 60,250 L 340,250 M 200,110 L 200,390" strokeWidth="0.5" />
        </svg>

        {/* Dynamic Snap-to-Layer Smart Drop Zones & Highlighting during Drag */}
        {draggedItemType && !readOnly && (
          <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 bg-black/15 backdrop-blur-[0.5px]">
            {/* Top guide banner */}
            <div className="self-center bg-stone-900/90 text-amber-300 border border-amber-400/50 text-[11px] font-bold py-1 px-3 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Thả vào vùng phát sáng để hít đồ</span>
            </div>

            {/* Smart Anatomical Highlights on Mannequin */}
            {draggedItemType === 'trad_head' && (
              <div className="absolute top-[6%] left-[26%] right-[26%] h-[20%] border-2 border-dashed border-amber-400 bg-amber-400/25 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.7)] animate-pulse flex items-center justify-center">
                <span className="bg-stone-900/95 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-amber-400/50 text-center shadow">
                  ✦ Vùng Đầu: Khăn Vấn / Nón / Hoa Cài
                </span>
              </div>
            )}

            {draggedItemType === 'mod_eye' && (
              <div className="absolute top-[12%] left-[28%] right-[28%] h-[15%] border-2 border-dashed border-amber-400 bg-amber-400/25 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.7)] animate-pulse flex items-center justify-center">
                <span className="bg-stone-900/95 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-400/50 text-center shadow">
                  ✦ Vùng Mắt: Kính Râm Retro
                </span>
              </div>
            )}

            {draggedItemType === 'trad_jewel' && (
              <div className="absolute top-[20%] left-[22%] right-[22%] h-[18%] border-2 border-dashed border-amber-300 bg-amber-300/25 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.7)] animate-pulse flex items-center justify-center">
                <span className="bg-stone-900/95 text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-md border border-amber-300/50 text-center shadow">
                  ✦ Vùng Cổ: Chuỗi Ngọc / Kim Khánh
                </span>
              </div>
            )}

            {draggedItemType === 'inner' && (
              <div className="absolute top-[23%] left-[24%] right-[24%] h-[22%] border-2 border-dashed border-rose-400 bg-rose-500/25 rounded-2xl shadow-[0_0_25px_rgba(244,63,94,0.7)] animate-pulse flex items-center justify-center">
                <span className="bg-stone-900/95 text-rose-200 text-[10px] font-bold px-2.5 py-1 rounded-md border border-rose-400/50 text-center shadow">
                  ✦ Vùng Thân Trong: Yếm Đào (L1)
                </span>
              </div>
            )}

            {draggedItemType === 'outer' && (
              <div className="absolute top-[20%] left-[10%] right-[10%] h-[56%] border-2 border-dashed border-rose-500 bg-rose-500/20 rounded-3xl shadow-[0_0_35px_rgba(225,29,72,0.7)] animate-pulse flex items-center justify-center">
                <span className="bg-rose-950/95 text-rose-100 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-rose-400/60 text-center shadow-lg">
                  ✦ Vùng Thân Áo: Cổ Phục Khoác Ngoài (L3)
                </span>
              </div>
            )}

            {draggedItemType === 'bottom' && (
              <div className="absolute top-[46%] left-[18%] right-[18%] h-[38%] border-2 border-dashed border-indigo-400 bg-indigo-500/25 rounded-2xl shadow-[0_0_25px_rgba(99,102,241,0.7)] animate-pulse flex items-center justify-center">
                <span className="bg-stone-900/95 text-indigo-200 text-[10px] font-bold px-2.5 py-1 rounded-md border border-indigo-400/50 text-center shadow">
                  ✦ Vùng Hạ Y: Quần Lĩnh / Váy Đụp (L2)
                </span>
              </div>
            )}

            {draggedItemType === 'mod_foot' && (
              <div className="absolute bottom-[2%] left-[18%] right-[18%] h-[20%] border-2 border-dashed border-emerald-400 bg-emerald-500/30 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.8)] animate-pulse flex items-center justify-center">
                <span className="bg-stone-900/95 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-400/50 text-center shadow">
                  ✦ Vùng Chân: Giày Sneaker / Boots
                </span>
              </div>
            )}

            {draggedItemType === 'mod_bag' && (
              <div className="absolute top-[42%] left-[6%] w-[38%] h-[32%] border-2 border-dashed border-amber-400 bg-amber-400/25 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.7)] animate-pulse flex items-center justify-center">
                <span className="bg-stone-900/95 text-amber-200 text-[10px] font-bold px-2 py-1 rounded-md border border-amber-400/50 text-center shadow">
                  ✦ Vùng Tay & Hông: Túi Xách / Quạt
                </span>
              </div>
            )}

            <div className="self-center text-center text-[10px] font-medium text-stone-300 bg-black/60 backdrop-blur-sm py-0.5 px-2.5 rounded-full">
              Thả chuột vào vùng phát sáng để hít đồ tự động
            </div>
          </div>
        )}

        {/* Snapped-to-Layer Toast */}
        {snappedFeedback && (
          <div className="absolute top-4 left-4 right-4 z-40 bg-emerald-600/95 text-white text-xs py-2 px-3 rounded-xl shadow-xl flex items-center justify-center gap-1.5 backdrop-blur-sm animate-bounce">
            <Check className="w-4 h-4 text-emerald-200 shrink-0" />
            <span className="font-bold truncate">Đã hít & trang bị: {snappedFeedback}!</span>
          </div>
        )}

        {/* Etiquette Alert Flag: TẢ NHIỆM WARNING (Pill Badge) */}
        {!isRightOverLeft && (
          <div className="absolute top-2 left-2 bg-red-600/95 text-white text-[11px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm border border-red-400/80 animate-pulse z-40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="font-bold truncate">Tả Nhiệm</span>
            {onLapelToggle && (
              <button
                type="button"
                onClick={onLapelToggle}
                className="ml-1 text-[10px] bg-white text-red-700 font-bold px-1.5 py-0.5 rounded-md shadow hover:bg-red-50 cursor-pointer shrink-0"
              >
                Sửa
              </button>
            )}
          </div>
        )}

        {/* AI Smart Layer Fusion Active Badge */}
        {isRightOverLeft && (
          <button 
            type="button"
            onClick={onToggleAiFusion}
            title={enableAiFusion 
              ? "AI Smart Layer Fusion đang hoạt động: Tự động lồng ghép vạt áo & hiệu ứng nếp vải (Click để tắt)" 
              : "AI Smart Layer Fusion đang tắt (Click để bật)"}
            className={`absolute top-2 right-2 z-30 font-semibold text-[10px] py-1 px-2.5 rounded-full shadow-sm flex items-center gap-1 cursor-pointer transition-all border backdrop-blur-sm active:scale-95 ${
              enableAiFusion
                ? 'bg-amber-950/90 hover:bg-amber-900 text-amber-300 border-amber-500/60 shadow-amber-950/40'
                : 'bg-stone-900/80 hover:bg-stone-800 text-stone-400 border-stone-700/80'
            }`}
          >
            <Wand2 className={`w-3 h-3 ${enableAiFusion ? 'text-amber-400 animate-pulse' : 'text-stone-500'}`} />
            <span>{enableAiFusion ? '✨ AI Fusion' : '⚡ Fusion OFF'}</span>
          </button>
        )}

        {/* 2D Vector Avatar Engine */}
        <svg
          ref={svgRef}
          viewBox="0 0 400 560"
          className={`w-full h-full max-h-[520px] drop-shadow-md transition-transform duration-300 ${
            isDraggingItem ? 'cursor-grabbing touch-none select-none' : ''
          }`}
          style={{ transform: `scale(${heightScale || 1})`, touchAction: isDraggingItem ? 'none' : 'auto' }}
        >
          <defs>
            {/* Skin Tone Gradient for 3D/Realistic Volume */}
            <linearGradient id="skin-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={skinTone} stopOpacity="0.88" />
              <stop offset="50%" stopColor={skinTone} stopOpacity="1" />
              <stop offset="100%" stopColor={skinTone} stopOpacity="0.88" />
            </linearGradient>

            {/* AI Smart Fusion: Ambient Occlusion Drop Shadow Filters */}
            <filter id="ai-ambient-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.25" />
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.15" />
            </filter>

            <filter id="fabric-depth-shadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="1.5" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.2" />
            </filter>

            {/* Pattern: Thủy Ba (Wave water motif) */}
            <pattern id="pat-thuy-ba" width="20" height="12" patternUnits="userSpaceOnUse">
              <path d="M 0,12 C 5,6 15,6 20,12 M 0,6 C 5,0 15,0 20,6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
            </pattern>

            {/* Pattern: Vân Mây (Cloud motif) */}
            <pattern id="pat-van-may" width="30" height="20" patternUnits="userSpaceOnUse">
              <path d="M 5,15 Q 10,8 18,12 Q 25,6 28,15" fill="none" stroke="rgba(255,215,0,0.4)" strokeWidth="1" />
            </pattern>

            {/* Pattern: Hoa Cúc (Chrysanthemum motif) */}
            <pattern id="pat-hoa-cuc" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
              <path d="M 12,4 L 12,20 M 4,12 L 20,12 M 6,6 L 18,18 M 6,18 L 18,6" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
            </pattern>

            {/* Clip path for user portrait photo projection onto face */}
            <clipPath id="avatar-face-clip">
              <ellipse cx="200" cy="98" rx="28" ry="34" />
            </clipPath>
          </defs>

          {/* ============================================================== */}
          {/* BASE: Avatar Mannequin Body (Polished Vector Illustration)     */}
          {/* ============================================================== */}
          <g id="mannequin-base" className="transition-all duration-300">
            {/* Shadow under feet */}
            <ellipse cx="200" cy="535" rx="75" ry="11" fill="rgba(0,0,0,0.22)" />

            {/* Gender Presentation helper flags */}
            {(() => {
              const gender = mannequin.genderPresentation || 'female';
              const isFemale = gender === 'female';
              const isMale = gender === 'male';
              
              // Torso widths and curvatures based on gender & proportion
              const shoulderWidth = isMale ? 64 * widthRatio : isFemale ? 52 * widthRatio : 56 * widthRatio;
              const waistWidth = isFemale ? 36 * widthRatio : isMale ? 44 * widthRatio : 40 * widthRatio;
              const hipWidth = isFemale ? 50 * widthRatio : isMale ? 44 * widthRatio : 46 * widthRatio;

              return (
                <g id="gender-mannequin-geometry">
                  {/* Neutral Anatomical Posture Guidelines (Fashion Sketch) */}
                  <g id="mannequin-sketch-posture-lines" opacity="0.3">
                    <line x1="200" y1="70" x2="200" y2="520" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="3 3" />
                    <line x1={200 - shoulderWidth} y1="152" x2={200 + shoulderWidth} y2="152" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="2 2" />
                    <line x1={200 - waistWidth} y1="240" x2={200 + waistWidth} y2="240" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="2 2" />
                    <line x1={200 - hipWidth} y1="290" x2={200 + hipWidth} y2="290" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="2 2" />
                  </g>
                  {/* Legs & Feet */}
                  <g id="mannequin-legs">
                    {/* Left Leg */}
                    <path
                      d={isFemale 
                        ? `M ${200 - waistWidth * 0.75},290 Q ${200 - hipWidth * 0.8},350 178,515 L 194,515 Q 192,420 192,290 Z`
                        : `M 176,380 Q 175,440 178,515 L 194,515 Q 192,440 192,380 Z`}
                      fill="url(#skin-gradient)"
                      stroke="rgba(0,0,0,0.08)"
                      strokeWidth="0.8"
                    />
                    {/* Right Leg */}
                    <path
                      d={isFemale 
                        ? `M ${200 + waistWidth * 0.75},290 Q ${200 + hipWidth * 0.8},350 222,515 L 206,515 Q 208,420 208,290 Z`
                        : `M 208,380 Q 208,440 206,515 L 222,515 Q 225,440 224,380 Z`}
                      fill="url(#skin-gradient)"
                      stroke="rgba(0,0,0,0.08)"
                      strokeWidth="0.8"
                    />
                    {/* Feet Contour */}
                    <ellipse cx="186" cy="516" rx="10" ry="4" fill={skinTone} />
                    <ellipse cx="214" cy="516" rx="10" ry="4" fill={skinTone} />
                  </g>

                  {/* Torso & Arms & Neck */}
                  <g id="mannequin-torso">
                    {/* Arms (Standing posture with elegant grace) */}
                    <path
                      d={`M ${200 - shoulderWidth},154 Q ${188 - shoulderWidth * 0.2},230 ${190 - shoulderWidth * 0.15},320 Q ${194 - shoulderWidth * 0.15},322 ${198 - shoulderWidth * 0.1},320 Q ${198 - shoulderWidth * 0.1},230 ${200 - shoulderWidth * 0.8},160 Z`}
                      fill={skinTone}
                      stroke="rgba(0,0,0,0.08)"
                      strokeWidth="0.8"
                    />
                    <path
                      d={`M ${200 + shoulderWidth},154 Q ${212 + shoulderWidth * 0.2},230 ${210 + shoulderWidth * 0.15},320 Q ${206 + shoulderWidth * 0.15},322 ${202 + shoulderWidth * 0.1},320 Q ${202 + shoulderWidth * 0.1},230 ${200 + shoulderWidth * 0.8},160 Z`}
                      fill={skinTone}
                      stroke="rgba(0,0,0,0.08)"
                      strokeWidth="0.8"
                    />

                    {/* Neck */}
                    <path
                      d={isFemale 
                        ? "M 189,122 Q 200,124 211,122 L 214,152 Q 200,156 186,152 Z"
                        : "M 187,124 Q 200,126 213,124 L 216,152 Q 200,157 184,152 Z"}
                      fill={skinTone}
                    />
                    {/* Clavicle / Collarbone */}
                    <path
                      d="M 182,154 Q 192,160 200,156 Q 208,160 218,154"
                      fill="none"
                      stroke="rgba(0,0,0,0.12)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />

                    {/* Shoulders & Main Torso Silhouette */}
                    <path
                      d={`M ${200 - shoulderWidth},152 C ${200 - shoulderWidth * 0.5},146 ${200 + shoulderWidth * 0.5},146 ${200 + shoulderWidth},152 L ${200 + waistWidth},240 L ${200 + hipWidth},290 Q 200,296 ${200 - hipWidth},290 L ${200 - waistWidth},240 Z`}
                      fill="url(#skin-gradient)"
                      stroke="rgba(0,0,0,0.08)"
                      strokeWidth="1"
                    />

                    {/* Female Bust Contour Highlights */}
                    {isFemale && (
                      <g opacity="0.18">
                        <path d="M 178,185 Q 188,202 200,198 Q 212,202 222,185" fill="none" stroke="#000000" strokeWidth="1.2" />
                      </g>
                    )}
                  </g>

                  {/* Head & Face */}
                  <g id="mannequin-head">
                    {/* Hair Back Silhouette (Female Hair Bun vs Male Clean Hairline) */}
                    {isFemale ? (
                      <g id="female-hair-bun">
                        <path
                          d="M 166,98 C 166,48 234,48 234,98 C 234,112 228,122 218,125 C 200,128 200,128 182,125 C 172,122 166,112 166,98 Z"
                          fill="#1C1917"
                          opacity="0.3"
                        />
                        {/* Elegant Hair Knot Bun at top back */}
                        <circle cx="200" cy="58" r="14" fill="#1C1917" opacity="0.35" />
                        <circle cx="200" cy="58" r="10" fill="#291D13" opacity="0.4" />
                      </g>
                    ) : (
                      <path
                        d="M 168,98 C 168,52 232,52 232,98 C 232,108 228,118 220,122 C 200,128 200,128 180,122 C 172,118 168,108 168,98 Z"
                        fill="#1C1917"
                        opacity="0.25"
                      />
                    )}

                    {/* Face Contour */}
                    <ellipse cx="200" cy="98" rx={isFemale ? 26 : 28} ry="34" fill="url(#skin-gradient)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                    
                    {faceImageUri ? (
                      <image
                        href={faceImageUri}
                        x="170"
                        y="62"
                        width="60"
                        height="72"
                        preserveAspectRatio="xMidYMid slice"
                        clipPath="url(#avatar-face-clip)"
                      />
                    ) : (
                      <g id="minimal-features" opacity="0.85">
                        {/* Eyebrows */}
                        <path d="M 181,85 Q 188,81 195,84" fill="none" stroke="#291D13" strokeWidth={isFemale ? "1.2" : "1.5"} strokeLinecap="round" />
                        <path d="M 205,84 Q 212,81 219,85" fill="none" stroke="#291D13" strokeWidth={isFemale ? "1.2" : "1.5"} strokeLinecap="round" />

                        {/* Eyes */}
                        <ellipse cx="188" cy="92" rx="4.5" ry={isFemale ? "3.2" : "2.8"} fill="#1C1917" />
                        <ellipse cx="212" cy="92" rx="4.5" ry={isFemale ? "3.2" : "2.8"} fill="#1C1917" />
                        <circle cx="187" cy="91" r="1" fill="#FFFFFF" />
                        <circle cx="211" cy="91" r="1" fill="#FFFFFF" />

                        {/* Eyelids & Eyelashes for Female */}
                        <path d="M 182,91 Q 188,87 194,91" fill="none" stroke="#3A2818" strokeWidth="1" />
                        <path d="M 206,91 Q 212,87 218,91" fill="none" stroke="#3A2818" strokeWidth="1" />
                        {isFemale && (
                          <>
                            <path d="M 192,89 L 195,87" stroke="#1C1917" strokeWidth="0.8" />
                            <path d="M 208,89 L 205,87" stroke="#1C1917" strokeWidth="0.8" />
                          </>
                        )}

                        {/* Nose */}
                        <path d="M 200,92 L 198,103 Q 200,105 202,103" fill="none" stroke="#523B28" strokeWidth="1.1" strokeLinecap="round" />

                        {/* Lips & Blush */}
                        {isFemale && (
                          <ellipse cx="180" cy="103" rx="4" ry="2" fill="#E11D48" opacity="0.18" />
                        )}
                        {isFemale && (
                          <ellipse cx="220" cy="103" rx="4" ry="2" fill="#E11D48" opacity="0.18" />
                        )}
                        <path d="M 191,114 Q 200,111 209,114 Q 200,121 191,114 Z" fill={isFemale ? "#BE123C" : "#991B1B"} opacity="0.85" />
                        <line x1="191" y1="114" x2="209" y2="114" stroke="#701A1A" strokeWidth="1" />
                      </g>
                    )}

                    {/* Ears */}
                    <ellipse cx={isFemale ? 173 : 171} cy="98" rx="3.8" ry="7.5" fill={skinTone} stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
                    <ellipse cx={isFemale ? 227 : 229} cy="98" rx="3.8" ry="7.5" fill={skinTone} stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
                  </g>
                </g>
              );
            })()}
          </g>

          {/* ============================================================== */}
          {/* LAYER 1: Inner Slip / Yếm (Undergarment)                       */}
          {/* AI Smart Layer Fusion: Collar Masking                          */}
          {/* ============================================================== */}
          {layer1_inner.visible && isInnerVisible && (
            <g 
              id="layer-1-yem" 
              transform={`translate(${innerTransform.x}, ${innerTransform.y}) rotate(${innerTransform.rotation}) scale(${innerTransform.scale})`}
              style={{ transformOrigin: '200px 185px', cursor: readOnly ? 'default' : isInnerDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
              onClick={(e) => {
                if (readOnly || !onSelectLayer) return;
                e.stopPropagation();
                onSelectLayer('layer_inner');
              }}
              onPointerDown={(e) => handleItemPointerDown(e, 'layer_inner')}
              onTouchStart={(e) => handleItemTouchStart(e, 'layer_inner')}
              className={`transition-all duration-300 ease-out ${
                isInnerDragging 
                  ? 'filter drop-shadow-[0_0_14px_rgba(244,63,94,0.95)] scale-[1.02]' 
                  : isInnerSelected 
                    ? 'filter drop-shadow-[0_0_10px_rgba(244,63,94,0.85)] scale-[1.01]' 
                    : 'hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] hover:scale-[1.01]'
              }`}
            >
              {/* Yếm Body (Diamond shape) */}
              <path
                d="M 188,145 Q 200,140 212,145 L 225,230 L 175,230 Z"
                fill={layer1_inner.color}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="1"
              />
              {/* AI Collar Masking: Peek-a-boo Yếm Neck Tie Ribbons */}
              <path d="M 188,145 Q 184,130 188,125" stroke={layer1_inner.color} strokeWidth="2.5" fill="none" />
              <path d="M 212,145 Q 216,130 212,125" stroke={layer1_inner.color} strokeWidth="2.5" fill="none" />
              {/* Center subtle seam */}
              <line x1="200" y1="145" x2="200" y2="230" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            </g>
          )}

          {/* ============================================================== */}
          {/* LAYER 2: Main Bottoms (Quần Lĩnh / Quần Lụa / Váy Đụp / Âu)    */}
          {/* ============================================================== */}
          {isBottomVisible && layer2_bottom.color && layer2_bottom.color !== 'transparent' && layer2_bottom.name !== 'Chưa mặc hạ y' && (
            <g 
              id="layer-2-bottoms"
              transform={`translate(${bottomTransform.x}, ${bottomTransform.y}) rotate(${bottomTransform.rotation}) scale(${bottomTransform.scale})`}
              style={{ transformOrigin: '200px 360px', cursor: readOnly ? 'default' : isBottomDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
              onClick={(e) => {
                if (readOnly || !onSelectLayer) return;
                e.stopPropagation();
                onSelectLayer('layer_bottom');
              }}
              onPointerDown={(e) => handleItemPointerDown(e, 'layer_bottom')}
              onTouchStart={(e) => handleItemTouchStart(e, 'layer_bottom')}
              className={`transition-all duration-300 ease-out ${
                isBottomDragging 
                  ? 'filter drop-shadow-[0_0_14px_rgba(6,182,212,0.95)] scale-[1.02]' 
                  : isBottomSelected 
                    ? 'filter drop-shadow-[0_0_10px_rgba(6,182,212,0.85)] scale-[1.01]' 
                    : 'hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] hover:scale-[1.01]'
              }`}
            >
              {layer2_bottom.type === 'skirt' ? (
                <g>
                  <path
                    d="M 172,255 L 228,255 L 248,460 L 152,460 Z"
                    fill={layer2_bottom.color}
                  />
                  <line x1="185" y1="255" x2="175" y2="460" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" />
                  <line x1="200" y1="255" x2="200" y2="460" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" />
                  <line x1="215" y1="255" x2="225" y2="460" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" />
                </g>
              ) : (
                <g>
                  <path
                    d="M 172,255 L 198,255 L 196,480 L 160,480 Z"
                    fill={layer2_bottom.color}
                  />
                  <path
                    d="M 202,255 L 228,255 L 240,480 L 204,480 Z"
                    fill={layer2_bottom.color}
                  />
                  <path d="M 176,260 L 172,475" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
                  <path d="M 224,260 L 228,475" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
                </g>
              )}
            </g>
          )}

          {/* ============================================================== */}
          {/* LAYER 3: Outer Robe (Áo Tấc / Nhật Bình / Ngũ Thân / Tứ Thân)  */}
          {/* AI Smart Fusion: Ambient Occlusion filters applied             */}
          {/* ============================================================== */}
          {isOuterVisible && (layer3_outer.robeColor || layer3_outer.family) && layer3_outer.robeColor !== 'transparent' && layer3_outer.name !== 'Chưa khoác áo ngoài' && (
            <g 
              id="layer-3-outer-robe"
            filter={enableAiFusion ? "url(#ai-ambient-shadow)" : undefined}
            transform={`translate(${outerTransform.x}, ${outerTransform.y}) rotate(${outerTransform.rotation}) scale(${outerTransform.scale})`}
            style={{ transformOrigin: '200px 280px', cursor: readOnly ? 'default' : isOuterDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
            onClick={(e) => {
              if (readOnly || !onSelectLayer) return;
              e.stopPropagation();
              onSelectLayer('layer_outer');
            }}
            onPointerDown={(e) => handleItemPointerDown(e, 'layer_outer')}
            onTouchStart={(e) => handleItemTouchStart(e, 'layer_outer')}
            className={`transition-all duration-300 ease-out ${
              isOuterDragging 
                ? 'filter drop-shadow-[0_0_16px_rgba(212,175,55,0.95)] scale-[1.02]' 
                : isOuterSelected 
                  ? 'filter drop-shadow-[0_0_12px_rgba(212,175,55,0.85)] scale-[1.01]' 
                  : 'hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] hover:scale-[1.01]'
            }`}
          >
            {/* Pattern texture overlay fill */}
            {layer3_outer.patternType === 'thuy_ba' && (
              <rect x="0" y="0" width="400" height="560" fill="url(#pat-thuy-ba)" opacity="0.35" pointerEvents="none" />
            )}
            {layer3_outer.patternType === 'van_may' && (
              <rect x="0" y="0" width="400" height="560" fill="url(#pat-van-may)" opacity="0.35" pointerEvents="none" />
            )}
            {layer3_outer.patternType === 'hoa_cuc' && (
              <rect x="0" y="0" width="400" height="560" fill="url(#pat-hoa-cuc)" opacity="0.3" pointerEvents="none" />
            )}

            {/* --- VARIANT A: ÁO TẤC (Ngũ Thân Tay Thụng) --- */}
            {layer3_outer.family === 'ao_tac' && (
              <g id="robe-ao-tac">
                {/* Left Sleeve */}
                <path
                  d={`M ${200 - 50 * widthRatio},150 L 95,210 L 90,340 L 125,360 L ${200 - 45 * widthRatio},260 Z`}
                  fill={layer3_outer.robeColor}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                />
                {/* Right Sleeve */}
                <path
                  d={`M ${200 + 50 * widthRatio},150 L 305,210 L 310,340 L 275,360 L ${200 + 45 * widthRatio},260 Z`}
                  fill={layer3_outer.robeColor}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                />

                {/* Main Body Robe Panel */}
                <path
                  d={`M ${200 - 48 * widthRatio},150 Q 200,146 ${200 + 48 * widthRatio},150 L ${200 + 55 * widthRatio},440 L ${200 - 55 * widthRatio},440 Z`}
                  fill={layer3_outer.robeColor}
                />

                {/* Hem Wave Trim */}
                <path
                  d={`M ${200 - 55 * widthRatio},425 L ${200 + 55 * widthRatio},425 L ${200 + 55 * widthRatio},440 L ${200 - 55 * widthRatio},440 Z`}
                  fill={layer3_outer.trimColor}
                  opacity="0.9"
                />

                {/* Standing Mandarin Collar */}
                <path
                  d="M 186,134 Q 200,131 214,134 L 214,148 Q 200,145 186,148 Z"
                  fill={layer3_outer.collarColor}
                  stroke={layer3_outer.trimColor}
                  strokeWidth="1.2"
                />
                {/* White Inner Collar Peek (Trung Đơn) */}
                <path d="M 188,131 Q 200,128 212,131" stroke="#FAF9F5" strokeWidth="2.5" fill="none" />

                {/* Lapel Overlay: Hữu nhiệm (Chuẩn) vs Tả nhiệm (Vi phạm) */}
                {isRightOverLeft ? (
                  <g id="lapel-huu-nhiem" filter={enableAiFusion ? "url(#fabric-depth-shadow)" : undefined}>
                    <path
                      d="M 200,148 Q 212,175 224,200 L 222,440 L 198,440 L 198,148 Z"
                      fill={layer3_outer.robeColor}
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth="1"
                    />
                    <circle cx="204" cy="154" r="2.5" fill={layer3_outer.trimColor} />
                    <circle cx="210" cy="168" r="2.5" fill={layer3_outer.trimColor} />
                    <circle cx="216" cy="184" r="2.5" fill={layer3_outer.trimColor} />
                    <circle cx="221" cy="202" r="2.5" fill={layer3_outer.trimColor} />
                    <circle cx="222" cy="225" r="2.5" fill={layer3_outer.trimColor} />
                  </g>
                ) : (
                  <g id="lapel-ta-nhiem" className="animate-pulse">
                    <path
                      d="M 200,148 Q 188,175 176,200 L 178,440 L 202,440 L 202,148 Z"
                      fill={layer3_outer.robeColor}
                      stroke="#DC2626"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                    <circle cx="196" cy="154" r="2.8" fill="#DC2626" />
                    <circle cx="190" cy="168" r="2.8" fill="#DC2626" />
                    <circle cx="184" cy="184" r="2.8" fill="#DC2626" />
                    <circle cx="179" cy="202" r="2.8" fill="#DC2626" />
                    <circle cx="178" cy="225" r="2.8" fill="#DC2626" />
                  </g>
                )}
              </g>
            )}

            {/* --- VARIANT B: ÁO NHẬT BÌNH (Triều Phục Hoàng Gia) --- */}
            {layer3_outer.family === 'ao_nhat_binh' && (
              <g id="robe-ao-nhat-binh">
                <path
                  d={`M ${200 - 50 * widthRatio},150 L 115,220 L 110,310 L 140,320 L ${200 - 45 * widthRatio},240 Z`}
                  fill={layer3_outer.robeColor}
                />
                <rect x="110" y="295" width="30" height="4" fill="#0D9488" />
                <rect x="110" y="299" width="30" height="4" fill="#DC2626" />
                <rect x="110" y="303" width="30" height="4" fill="#F59E0B" />
                <rect x="110" y="307" width="30" height="4" fill="#FAF9F5" />
                <rect x="110" y="311" width="30" height="4" fill="#1E3A8A" />

                <path
                  d={`M ${200 + 50 * widthRatio},150 L 285,220 L 290,310 L 260,320 L ${200 + 45 * widthRatio},240 Z`}
                  fill={layer3_outer.robeColor}
                />
                <rect x="260" y="295" width="30" height="4" fill="#0D9488" />
                <rect x="260" y="299" width="30" height="4" fill="#DC2626" />
                <rect x="260" y="303" width="30" height="4" fill="#F59E0B" />
                <rect x="260" y="307" width="30" height="4" fill="#FAF9F5" />
                <rect x="260" y="311" width="30" height="4" fill="#1E3A8A" />

                <path
                  d={`M ${200 - 46 * widthRatio},150 Q 200,146 ${200 + 46 * widthRatio},150 L ${200 + 52 * widthRatio},440 L ${200 - 52 * widthRatio},440 Z`}
                  fill={layer3_outer.robeColor}
                />

                <path
                  d="M 186,145 L 214,145 L 214,240 L 186,240 Z"
                  fill={layer3_outer.collarColor}
                  stroke={layer3_outer.trimColor}
                  strokeWidth="1.5"
                />
                <line x1="190" y1="145" x2="190" y2="240" stroke="#0D9488" strokeWidth="1.5" />
                <line x1="194" y1="145" x2="194" y2="240" stroke="#DC2626" strokeWidth="1.5" />
                <line x1="200" y1="145" x2="200" y2="240" stroke="#F59E0B" strokeWidth="2" />
                <line x1="206" y1="145" x2="206" y2="240" stroke="#FAF9F5" strokeWidth="1.5" />
                <line x1="210" y1="145" x2="210" y2="240" stroke="#1E3A8A" strokeWidth="1.5" />

                <circle cx="200" cy="180" r="4.5" fill="#FBBF24" stroke="#78350F" strokeWidth="1" />
                <circle cx="200" cy="180" r="2.5" fill="#047857" />

                <path
                  d={`M ${200 - 52 * widthRatio},415 L ${200 + 52 * widthRatio},415 L ${200 + 52 * widthRatio},440 L ${200 - 52 * widthRatio},440 Z`}
                  fill={layer3_outer.trimColor}
                  opacity="0.95"
                />
              </g>
            )}

            {/* --- VARIANT C: ÁO NGŨ THÂN TAY CHẼN --- */}
            {(layer3_outer.family === 'ao_ngu_than_chen' || (layer3_outer.family as string) === 'ao_ngu_than_tay_chen') && (
              <g id="robe-ao-ngu-than-chen">
                <path
                  d={`M ${200 - 48 * widthRatio},150 L 140,240 L 138,340 L 152,342 L ${200 - 38 * widthRatio},220 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path
                  d={`M ${200 + 48 * widthRatio},150 L 260,240 L 262,340 L 248,342 L ${200 + 38 * widthRatio},220 Z`}
                  fill={layer3_outer.robeColor}
                />

                <path
                  d={`M ${200 - 45 * widthRatio},150 Q 200,146 ${200 + 45 * widthRatio},150 L ${200 + 48 * widthRatio},435 L ${200 - 48 * widthRatio},435 Z`}
                  fill={layer3_outer.robeColor}
                />

                <path
                  d="M 187,136 Q 200,133 213,136 L 213,149 Q 200,146 187,149 Z"
                  fill={layer3_outer.collarColor}
                  stroke={layer3_outer.trimColor}
                  strokeWidth="1.2"
                />

                {isRightOverLeft ? (
                  <g id="lapel-chen-huu" filter={enableAiFusion ? "url(#fabric-depth-shadow)" : undefined}>
                    <path
                      d="M 200,149 Q 210,180 220,205 L 218,435 L 202,435 L 202,149 Z"
                      fill={layer3_outer.robeColor}
                      stroke="rgba(0,0,0,0.25)"
                      strokeWidth="1"
                    />
                    <circle cx="205" cy="155" r="2.2" fill={layer3_outer.trimColor} />
                    <circle cx="210" cy="170" r="2.2" fill={layer3_outer.trimColor} />
                    <circle cx="214" cy="188" r="2.2" fill={layer3_outer.trimColor} />
                    <circle cx="218" cy="208" r="2.2" fill={layer3_outer.trimColor} />
                    <circle cx="219" cy="230" r="2.2" fill={layer3_outer.trimColor} />
                  </g>
                ) : (
                  <g id="lapel-chen-ta" className="animate-pulse">
                    <path
                      d="M 200,149 Q 190,180 180,205 L 182,435 L 198,435 L 198,149 Z"
                      fill={layer3_outer.robeColor}
                      stroke="#DC2626"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                    <circle cx="195" cy="155" r="2.4" fill="#DC2626" />
                    <circle cx="190" cy="170" r="2.4" fill="#DC2626" />
                    <circle cx="186" cy="188" r="2.4" fill="#DC2626" />
                    <circle cx="182" cy="208" r="2.4" fill="#DC2626" />
                  </g>
                )}
              </g>
            )}

            {/* --- VARIANT D: ÁO TỨ THÂN (Kinh Bắc Dân Gian) --- */}
            {layer3_outer.family === 'ao_tu_than' && (
              <g id="robe-ao-tu-than">
                <path
                  d={`M ${200 - 48 * widthRatio},150 L 130,225 L 125,320 L 140,325 L ${200 - 40 * widthRatio},220 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path
                  d={`M ${200 + 48 * widthRatio},150 L 270,225 L 275,320 L 260,325 L ${200 + 40 * widthRatio},220 Z`}
                  fill={layer3_outer.robeColor}
                />

                <path
                  d={`M ${200 - 44 * widthRatio},150 L ${200 + 44 * widthRatio},150 L ${200 + 48 * widthRatio},435 L ${200 - 48 * widthRatio},435 Z`}
                  fill={layer3_outer.robeColor}
                />

                {/* Front 2 Flaps opened wide revealing inner Yếm */}
                <path
                  d={`M ${200 - 44 * widthRatio},150 L 175,220 L 170,380 L 160,380 L ${200 - 48 * widthRatio},435 Z`}
                  fill={layer3_outer.robeColor}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                />
                <path
                  d={`M ${200 + 44 * widthRatio},150 L 225,220 L 230,380 L 240,380 L ${200 + 48 * widthRatio},435 Z`}
                  fill={layer3_outer.robeColor}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                />

                <path
                  d="M 172,235 L 228,235 L 228,248 L 172,248 Z"
                  fill={layer3_outer.trimColor}
                />
                <path d="M 194,248 L 190,360 L 198,360 L 200,248 Z" fill={layer3_outer.trimColor} />
                <path d="M 202,248 L 206,350 L 212,350 L 206,248 Z" fill="#DC2626" />
              </g>
            )}

            {/* --- VARIANT E: ÁO GIAO LĨNH (Thời Lý - Trần - Lê Sơ) --- */}
            {layer3_outer.family === 'ao_giao_linh' && (
              <g id="robe-ao-giao-linh">
                <path
                  d={`M ${200 - 52 * widthRatio},150 L 98,220 L 105,350 L 140,360 L ${200 - 45 * widthRatio},250 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path
                  d={`M ${200 + 52 * widthRatio},150 L 302,220 L 295,350 L 260,360 L ${200 + 45 * widthRatio},250 Z`}
                  fill={layer3_outer.robeColor}
                />

                <path
                  d={`M ${200 - 48 * widthRatio},150 L ${200 + 48 * widthRatio},150 L ${200 + 58 * widthRatio},445 L ${200 - 58 * widthRatio},445 Z`}
                  fill={layer3_outer.robeColor}
                />

                {isRightOverLeft ? (
                  <g id="giao-linh-huu" filter={enableAiFusion ? "url(#fabric-depth-shadow)" : undefined}>
                    <path d="M 215,145 L 180,230 L 180,250 L 218,145 Z" fill={layer3_outer.collarColor} />
                    <path
                      d="M 185,145 L 228,235 L 220,255 L 182,150 Z"
                      fill={layer3_outer.collarColor}
                      stroke={layer3_outer.trimColor}
                      strokeWidth="1.5"
                    />
                  </g>
                ) : (
                  <g id="giao-linh-ta" className="animate-pulse">
                    <path
                      d="M 215,145 L 172,235 L 180,255 L 218,150 Z"
                      fill={layer3_outer.collarColor}
                      stroke="#DC2626"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />
                  </g>
                )}

                <rect x="172" y="240" width="56" height="14" fill={layer3_outer.trimColor} rx="2" />
              </g>
            )}

            {/* --- VARIANT F: ÁO DÀI TÂN THỜI --- */}
            {layer3_outer.family === 'ao_dai' && (
              <g id="robe-ao-dai">
                <path
                  d={`M ${200 - 45 * widthRatio},150 L 145,230 L 140,335 L 152,336 L ${200 - 36 * widthRatio},210 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path
                  d={`M ${200 + 45 * widthRatio},150 L 255,230 L 260,335 L 248,336 L ${200 + 36 * widthRatio},210 Z`}
                  fill={layer3_outer.robeColor}
                />

                <path
                  d={`M ${200 - 40 * widthRatio},150 Q 200,146 ${200 + 40 * widthRatio},150 L ${200 + 34 * widthRatio},235 L ${200 - 34 * widthRatio},235 Z`}
                  fill={layer3_outer.robeColor}
                />

                <path
                  d={`M ${200 - 32 * widthRatio},235 L ${200 + 32 * widthRatio},235 L ${200 + 42 * widthRatio},445 L ${200 - 42 * widthRatio},445 Z`}
                  fill={layer3_outer.robeColor}
                />

                <path
                  d="M 188,136 Q 200,133 212,136 L 212,148 Q 200,145 188,148 Z"
                  fill={layer3_outer.collarColor}
                  stroke={layer3_outer.trimColor}
                  strokeWidth="1"
                />
              </g>
            )}

            {/* --- VARIANT G: ÁO BÀ BA NAM BỘ --- */}
            {layer3_outer.family === 'ao_ba_ba' && (
              <g id="robe-ao-ba-ba">
                <path
                  d={`M ${200 - 45 * widthRatio},150 L 142,230 L 140,320 L 154,322 L ${200 - 36 * widthRatio},210 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path
                  d={`M ${200 + 45 * widthRatio},150 L 258,230 L 260,320 L 246,322 L ${200 + 36 * widthRatio},210 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path
                  d={`M ${200 - 40 * widthRatio},150 Q 200,146 ${200 + 40 * widthRatio},150 L ${200 + 44 * widthRatio},350 L ${200 - 44 * widthRatio},350 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path
                  d="M 188,145 Q 200,158 212,145"
                  stroke={layer3_outer.collarColor || "#FAF9F5"}
                  strokeWidth="2.5"
                  fill="none"
                />
                <line x1="200" y1="158" x2="200" y2="340" stroke="rgba(0,0,0,0.15)" strokeWidth="1.2" />
                <circle cx="200" cy="170" r="2" fill={layer3_outer.trimColor || "#EC4899"} />
                <circle cx="200" cy="190" r="2" fill={layer3_outer.trimColor || "#EC4899"} />
                <circle cx="200" cy="210" r="2" fill={layer3_outer.trimColor || "#EC4899"} />
                <circle cx="200" cy="230" r="2" fill={layer3_outer.trimColor || "#EC4899"} />
                <line x1={200 - 44 * widthRatio} y1="310" x2={200 - 44 * widthRatio} y2="350" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
                <line x1={200 + 44 * widthRatio} y1="310" x2={200 + 44 * widthRatio} y2="350" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
              </g>
            )}

            {/* --- VARIANT H: ÁO THỔ CẨM DỆT TAY (Tây Bắc & Tây Nguyên) --- */}
            {layer3_outer.family === 'ao_tho_cam' && (
              <g id="robe-ao-tho-cam">
                <path
                  d={`M ${200 - 46 * widthRatio},150 L 135,235 L 132,325 L 148,327 L ${200 - 37 * widthRatio},215 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path
                  d={`M ${200 + 46 * widthRatio},150 L 265,235 L 268,325 L 252,327 L ${200 + 37 * widthRatio},215 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path
                  d={`M ${200 - 42 * widthRatio},150 Q 200,146 ${200 + 42 * widthRatio},150 L ${200 + 45 * widthRatio},340 L ${200 - 45 * widthRatio},340 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path
                  d="M 180,150 L 220,150 L 210,340 L 190,340 Z"
                  fill={layer3_outer.collarColor || "#DC2626"}
                  opacity="0.8"
                />
                <path d="M 182,150 L 182,340" stroke={layer3_outer.trimColor || "#F59E0B"} strokeWidth="2" strokeDasharray="3 3" />
                <path d="M 218,150 L 218,340" stroke={layer3_outer.trimColor || "#F59E0B"} strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="188" cy="180" r="3" fill="#E2E8F0" />
                <circle cx="212" cy="180" r="3" fill="#E2E8F0" />
                <circle cx="188" cy="220" r="3" fill="#E2E8F0" />
                <circle cx="212" cy="220" r="3" fill="#E2E8F0" />
              </g>
            )}

            {/* --- VARIANT I: ÁO CỔ TRUYỀN DÂN TỘC CHĂM --- */}
            {layer3_outer.family === 'ao_cham' && (
              <g id="robe-ao-cham">
                <path
                  d={`M ${200 - 44 * widthRatio},150 L 140,225 L 138,330 L 150,332 L ${200 - 35 * widthRatio},210 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path
                  d={`M ${200 + 44 * widthRatio},150 L 260,225 L 262,330 L 250,332 L ${200 + 35 * widthRatio},210 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path
                  d={`M ${200 - 38 * widthRatio},150 Q 200,146 ${200 + 38 * widthRatio},150 L ${200 + 44 * widthRatio},440 L ${200 - 44 * widthRatio},440 Z`}
                  fill={layer3_outer.robeColor}
                />
                <path d="M 188,145 L 200,170 L 212,145 Z" fill={layer3_outer.collarColor || "#F97316"} />
                <rect x="160" y="250" width="80" height="16" fill={layer3_outer.trimColor || "#D97706"} rx="2" />
                <path d="M 160,254 L 240,254" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="4 2" />
                <path d="M 160,262 L 240,262" stroke="#1E3A8A" strokeWidth="1.5" strokeDasharray="4 2" />
              </g>
            )}

            {/* --- GENERIC / FALLBACK VIETNAMESE ROBE (Guarantees Robe is NEVER lost or invisible) --- */}
            {!['ao_tac', 'ao_nhat_binh', 'ao_ngu_than_chen', 'ao_ngu_than_tay_chen', 'ao_tu_than', 'ao_giao_linh', 'ao_dai', 'ao_ba_ba', 'ao_tho_cam', 'ao_cham'].includes(layer3_outer.family || '') && (
              <g id="robe-generic-heritage">
                {/* Fallback Sleeves */}
                <path
                  d={`M ${200 - 48 * widthRatio},150 L 115,220 L 110,330 L 138,340 L ${200 - 40 * widthRatio},230 Z`}
                  fill={layer3_outer.robeColor || '#1E3A8A'}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                />
                <path
                  d={`M ${200 + 48 * widthRatio},150 L 285,220 L 290,330 L 262,340 L ${200 + 40 * widthRatio},230 Z`}
                  fill={layer3_outer.robeColor || '#1E3A8A'}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                />
                {/* Fallback Body */}
                <path
                  d={`M ${200 - 46 * widthRatio},150 Q 200,146 ${200 + 46 * widthRatio},150 L ${200 + 50 * widthRatio},440 L ${200 - 50 * widthRatio},440 Z`}
                  fill={layer3_outer.robeColor || '#1E3A8A'}
                />
                {/* Collar */}
                <path
                  d="M 186,134 Q 200,131 214,134 L 214,148 Q 200,145 186,148 Z"
                  fill={layer3_outer.collarColor || '#FAF9F5'}
                  stroke={layer3_outer.trimColor || '#D97706'}
                  strokeWidth="1.2"
                />
                {/* Trim Hem */}
                <path
                  d={`M ${200 - 50 * widthRatio},425 L ${200 + 50 * widthRatio},425 L ${200 + 50 * widthRatio},440 L ${200 - 50 * widthRatio},440 Z`}
                  fill={layer3_outer.trimColor || '#D97706'}
                  opacity="0.9"
                />
              </g>
            )}
          </g>
          )}

          {/* ============================================================== */}
          {/* LAYER 4: Traditional Footwear & Fallback Accessories           */}
          {/* ============================================================== */}
          <g id="layer-4-traditional-accessories">
            {/* Hài Thêu Phượng (Chân) */}
            {!layer5_modernAccessory.footwearId && layer4_tradAccessory.footwearId === 'hai_theu_phuong' && (
              <g id="acc-hai-theu">
                <path d="M 162,510 Q 158,520 176,522 L 188,522 Q 192,512 184,508 Z" fill="#991B1B" />
                <path d="M 212,508 Q 208,512 216,522 L 228,522 Q 242,520 238,510 Z" fill="#991B1B" />
              </g>
            )}

            {/* Fallback rendering only if interactive dynamic layers are empty */}
            {interactiveAccessoryLayers.length === 0 && (
              <>
                {/* Khăn Vấn fallback */}
                {layer4_tradAccessory.headwearId?.includes('khan_van') && (
                  <g id="acc-khan-van">
                    <path
                      d="M 166,74 Q 200,56 234,74 Q 238,88 230,94 Q 200,82 170,94 Q 162,88 166,74 Z"
                      fill={layer4_tradAccessory.headwearColor || '#0F172A'}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                    />
                    <path d="M 170,80 Q 200,68 230,80" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
                    <path d="M 174,86 Q 200,74 226,86" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
                  </g>
                )}

                {/* Nón Quai Thao fallback */}
                {layer4_tradAccessory.headwearId === 'non_quai_thao' && (
                  <g id="acc-non-quai-thao">
                    <ellipse cx="265" cy="180" rx="42" ry="42" fill="#E2E8F0" stroke="#78350F" strokeWidth="2" opacity="0.95" />
                    <circle cx="265" cy="180" r="14" fill="#CBD5E1" stroke="#78350F" strokeWidth="1" />
                    <path d="M 235,165 Q 200,190 190,220" stroke="#991B1B" strokeWidth="2.5" fill="none" />
                  </g>
                )}

                {/* Chuỗi Hạt Ngọc Bích fallback */}
                {layer4_tradAccessory.jewelryId === 'chuoi_ngoc_bich' && (
                  <g id="acc-chuoi-ngoc" fill="#059669" stroke="#047857" strokeWidth="0.5">
                    <circle cx="192" cy="155" r="2.2" />
                    <circle cx="196" cy="160" r="2.2" />
                    <circle cx="200" cy="162" r="2.5" />
                    <circle cx="204" cy="160" r="2.2" />
                    <circle cx="208" cy="155" r="2.2" />
                  </g>
                )}

                {/* Kim Khánh / Thẻ Bài fallback */}
                {layer4_tradAccessory.jewelryId === 'kim_khanh_the_bai' && (
                  <g id="acc-kim-khanh">
                    <rect x="195" y="160" width="10" height="20" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="1" />
                    <path d="M 200,180 L 200,195" stroke="#DC2626" strokeWidth="2" />
                  </g>
                )}
              </>
            )}
          </g>

          {/* ============================================================== */}
          {/* LAYER 5: Modern Footwear & Fallback Accessories                */}
          {/* ============================================================== */}
          <g id="layer-5-modern-accessories">
            {/* Chunky Sneakers (Chân) */}
            {layer5_modernAccessory.footwearId === 'chunky_sneakers' && (
              <g id="acc-chunky-sneakers">
                <path d="M 160,505 L 150,522 L 186,525 L 188,506 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <rect x="148" y="520" width="40" height="8" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
                <path d="M 212,506 L 214,525 L 250,522 L 240,505 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <rect x="212" y="520" width="40" height="8" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
              </g>
            )}

            {/* Chelsea Boots (Chân) */}
            {layer5_modernAccessory.footwearId === 'chelsea_boots' && (
              <g id="acc-chelsea-boots">
                <path d="M 162,490 L 154,525 L 186,526 L 182,490 Z" fill="#0F172A" stroke="#334155" strokeWidth="1" />
                <path d="M 218,490 L 214,526 L 246,525 L 238,490 Z" fill="#0F172A" stroke="#334155" strokeWidth="1" />
              </g>
            )}

            {/* Fallback rendering only if interactive dynamic layers are empty */}
            {interactiveAccessoryLayers.length === 0 && (
              <>
                {/* Kính Râm Oval Retro fallback */}
                {layer5_modernAccessory.eyewearId === 'kinh_ram_retro' && (
                  <g id="acc-kinh-ram" fill="#0F172A" stroke="#D97706" strokeWidth="1.2">
                    <ellipse cx="190" cy="94" rx="7.5" ry="4.5" />
                    <ellipse cx="210" cy="94" rx="7.5" ry="4.5" />
                    <line x1="197" y1="94" x2="203" y2="94" stroke="#D97706" strokeWidth="1.5" />
                    <line x1="183" y1="94" x2="172" y2="92" stroke="#D97706" strokeWidth="1" />
                    <line x1="217" y1="94" x2="228" y2="92" stroke="#D97706" strokeWidth="1" />
                  </g>
                )}

                {/* Canvas Tote Bag fallback */}
                {layer5_modernAccessory.bagId === 'canvas_tote' && (
                  <g id="acc-canvas-tote">
                    <path d="M 165,155 L 125,290" stroke="#78716C" strokeWidth="3" fill="none" />
                    <rect x="105" y="285" width="38" height="52" rx="4" fill="#FAF9F5" stroke="#D6D3D1" strokeWidth="1.5" />
                    <path d="M 112,305 Q 124,295 136,305" stroke="#991B1B" strokeWidth="2" fill="none" />
                    <line x1="116" y1="318" x2="132" y2="318" stroke="#0F172A" strokeWidth="1" />
                  </g>
                )}

                {/* Baguette Bag fallback */}
                {layer5_modernAccessory.bagId === 'baguette_bag' && (
                  <g id="acc-baguette-bag">
                    <path d="M 245,210 Q 260,225 265,245" stroke="#0F172A" strokeWidth="2.5" fill="none" />
                    <rect x="250" y="240" width="32" height="18" rx="4" fill="#1C1917" stroke="#D97706" strokeWidth="1" />
                    <circle cx="266" cy="249" r="2" fill="#D97706" />
                  </g>
                )}
              </>
            )}
          </g>

          {/* ============================================================== */}
          {/* INTERACTIVE ACCESSORIES & PROPS WITH DIRECT SWIPE / GESTURE     */}
          {/* Supports touch swiping, dragging, rotating, scaling, & bounding */}
          {/* ============================================================== */}
          {interactiveAccessoryLayers.filter(l => l.visible && !['layer_outer', 'layer_inner', 'layer_bottom'].includes(l.id)).map((dynLayer) => {
            // Anchor default positions for accessories based on type and category
            let anchorX = 200;
            let anchorY = 200;
            let boxW = 50;
            let boxH = 50;

            const tType = (dynLayer.type || '').toLowerCase();
            const lId = (dynLayer.id || '').toLowerCase();

            if (tType.includes('quat') || lId.includes('quat')) {
              anchorX = 295;
              anchorY = 320;
              boxW = 60;
              boxH = 65;
            } else if (tType.includes('hoa_cai') || lId.includes('hoa') || tType.includes('hoa')) {
              anchorX = 224;
              anchorY = 78;
              boxW = 34;
              boxH = 34;
            } else if (tType.includes('non_quai_thao') || lId.includes('non_quai_thao')) {
              anchorX = 200;
              anchorY = 62;
              boxW = 86;
              boxH = 86;
            } else if (tType.includes('non_la') || lId.includes('non_la')) {
              anchorX = 200;
              anchorY = 62;
              boxW = 78;
              boxH = 78;
            } else if (tType.includes('khan_van') || lId.includes('headwear') || tType.includes('khan')) {
              anchorX = 200;
              anchorY = 72; // Calibrated snugly on top of forehead
              boxW = 76;
              boxH = 40;
            } else if (tType.includes('kinh') || lId.includes('eyewear')) {
              anchorX = 200;
              anchorY = 88; // Calibrated directly on mannequin eyes level
              boxW = 56;
              boxH = 26;
            } else if (tType.includes('tote') || tType.includes('canvas') || lId.includes('canvas')) {
              anchorX = 135;
              anchorY = 290;
              boxW = 50;
              boxH = 64;
            } else if (tType.includes('baguette') || lId.includes('baguette')) {
              anchorX = 265;
              anchorY = 235;
              boxW = 44;
              boxH = 30;
            } else if (tType.includes('tui_gam') || lId.includes('tui_gam') || (dynLayer.category === 'trad_accessory' && tType.includes('tui'))) {
              anchorX = 145;
              anchorY = 295;
              boxW = 46;
              boxH = 54;
            } else if (tType.includes('chuoi_ngoc') || lId.includes('chuoi') || tType.includes('chuoi')) {
              anchorX = 200;
              anchorY = 145; // Calibrated on neck/chest level
              boxW = 42;
              boxH = 24;
            } else if (tType.includes('the_bai') || tType.includes('kim_khanh') || lId.includes('jewelry')) {
              anchorX = 200;
              anchorY = 160;
              boxW = 30;
              boxH = 44;
            } else if (tType.includes('sneaker') || tType.includes('boot') || tType.includes('hai') || lId.includes('footwear')) {
              anchorX = 200;
              anchorY = 515;
              boxW = 90;
              boxH = 32;
            } else if (dynLayer.category === 'modern_accessory') {
              anchorX = 200;
              anchorY = 110;
              boxW = 48;
              boxH = 30;
            } else if (dynLayer.category === 'prop') {
              anchorX = 130;
              anchorY = 290;
              boxW = 50;
              boxH = 60;
            }

            const t = dynLayer.transform || { x: 0, y: 0, scale: 1, rotation: 0 };
            const isSelected = selectedLayerId === dynLayer.id;
            const isDraggingThis = isDraggingItem && draggingLayerId.current === dynLayer.id;

            return (
              <g
                key={dynLayer.id}
                id={`dyn-layer-${dynLayer.id}`}
                transform={`translate(${anchorX + t.x}, ${anchorY + t.y}) rotate(${t.rotation}) scale(${t.scale})`}
                onPointerDown={(e) => handleItemPointerDown(e, dynLayer.id)}
                onTouchStart={(e) => handleItemTouchStart(e, dynLayer.id)}
                onClick={(e) => {
                  if (readOnly || !onSelectLayer) return;
                  e.stopPropagation();
                  onSelectLayer(dynLayer.id);
                }}
                style={{ touchAction: 'none' }}
                className={`transition-transform select-none ${
                  isDraggingThis 
                    ? 'cursor-grabbing filter drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]' 
                    : isSelected 
                      ? 'cursor-grab filter drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]' 
                      : 'cursor-grab hover:filter hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]'
                }`}
              >
                {/* 1. Khăn Vấn Nhung / Gấm / Khăn Xếp / Khăn Trùm / Mũ */}
                {(tType.includes('khan_van') || lId.includes('headwear') || tType.includes('khan') || tType.includes('mu') || tType.includes('bang_do')) && (
                  <g id="prop-headwear">
                    {tType.includes('mu_bucket') || tType.includes('bucket') ? (
                      <g id="prop-mu-bucket">
                        <path d="M -22,-10 L 22,-10 L 18,-24 L -18,-24 Z" fill="#1E293B" stroke="#475569" strokeWidth="1" />
                        <path d="M -30,-8 L 30,-8 L 22,-12 L -22,-12 Z" fill="#334155" stroke="#475569" strokeWidth="1" />
                      </g>
                    ) : tType.includes('mu_phot') || tType.includes('beret') ? (
                      <g id="prop-mu-phot">
                        <path d="M -28,-6 Q 0,-26 28,-6 Q 18,8 -18,8 Z" fill="#57534E" stroke="#292524" strokeWidth="1" />
                        <path d="M -24,-2 L 24,-2" stroke="#D97706" strokeWidth="1.5" />
                      </g>
                    ) : tType.includes('khan_dao_do') || tType.includes('dao_do') ? (
                      <g id="prop-khan-dao-do">
                        <path d="M -32,-8 Q 0,-20 32,-8 L 36,12 Q 0,4 -36,12 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
                        <circle cx="-20" cy="14" r="2.5" fill="#E2E8F0" />
                        <circle cx="0" cy="14" r="2.5" fill="#E2E8F0" />
                        <circle cx="20" cy="14" r="2.5" fill="#E2E8F0" />
                      </g>
                    ) : tType.includes('khan_bong') || tType.includes('hmong') ? (
                      <g id="prop-khan-hmong">
                        <path d="M -30,-6 Q 0,-18 30,-6 L 30,8 Q 0,-2 -30,8 Z" fill="#1E1B4B" />
                        <circle cx="-24" cy="-12" r="5" fill="#DC2626" />
                        <circle cx="-12" cy="-15" r="5" fill="#DC2626" />
                        <circle cx="0" cy="-16" r="5.5" fill="#DC2626" />
                        <circle cx="12" cy="-15" r="5" fill="#DC2626" />
                        <circle cx="24" cy="-12" r="5" fill="#DC2626" />
                      </g>
                    ) : tType.includes('khan_trum_mblao') || tType.includes('mblao') ? (
                      <g id="prop-khan-mblao">
                        <path d="M -28,-8 Q 0,-18 28,-8 L 32,30 L 24,32 L 20,4 Q 0,-4 -20,4 L -24,32 L -32,30 Z" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1" />
                      </g>
                    ) : tType.includes('bang_do') ? (
                      <g id="prop-bang-do">
                        <path d="M -26,-4 Q 0,-14 26,-4 Q 28,4 24,6 Q 0,-4 -24,6 Z" fill="#0284C7" stroke="#F59E0B" strokeWidth="1" />
                        <circle cx="0" cy="-10" r="3" fill="#F59E0B" />
                      </g>
                    ) : (
                      <g id="prop-khan-van-standard">
                        <path
                          d="M -34,-6 Q 0,-22 34,-6 Q 38,10 30,16 Q 0,4 -30,16 Q -38,10 -34,-6 Z"
                          fill={dynLayer.color || '#0F172A'}
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="1"
                        />
                        <path d="M -30,0 Q 0,-12 30,0" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
                        <path d="M -26,6 Q 0,-6 26,6" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
                      </g>
                    )}
                  </g>
                )}

                {/* 2. Nón Quai Thao Kinh Bắc */}
                {(tType.includes('non_quai_thao') || lId.includes('non_quai_thao')) && (
                  <g id="prop-non-quai-thao">
                    <ellipse cx="0" cy="0" rx="42" ry="42" fill="#E2E8F0" stroke="#78350F" strokeWidth="2" opacity="0.95" />
                    <circle cx="0" cy="0" r="14" fill="#CBD5E1" stroke="#78350F" strokeWidth="1" />
                    {/* Dải quai thao lụa điều */}
                    <path d="M -30,-15 Q -65,10 -75,40" stroke="#991B1B" strokeWidth="2.5" fill="none" />
                  </g>
                )}

                {/* 3. Nón Lá Xứ Huế */}
                {(tType.includes('non_la') || lId.includes('non_la')) && (
                  <g id="prop-non-la">
                    <polygon points="0,-36 -38,24 38,24" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" opacity="0.95" />
                    <line x1="-24" y1="4" x2="24" y2="4" stroke="#F59E0B" strokeWidth="0.8" />
                    <line x1="-12" y1="-16" x2="12" y2="-16" stroke="#F59E0B" strokeWidth="0.8" />
                    <path d="M -22,24 Q -45,50 -55,70" stroke="#EC4899" strokeWidth="2" fill="none" />
                  </g>
                )}

                {/* 4. Quạt nan gỗ xếp cầm tay */}
                {(tType.includes('quat') || lId.includes('quat')) && (
                  <g id="prop-quat-xep">
                    <path
                      d="M 0,0 L -30,-45 A 50,50 0 0,1 30,-45 Z"
                      fill={dynLayer.color || "#D97706"}
                      stroke="#78350F"
                      strokeWidth="1.2"
                    />
                    <line x1="0" y1="0" x2="-20" y2="-45" stroke="#78350F" strokeWidth="0.8" />
                    <line x1="0" y1="0" x2="-7" y2="-48" stroke="#78350F" strokeWidth="0.8" />
                    <line x1="0" y1="0" x2="7" y2="-48" stroke="#78350F" strokeWidth="0.8" />
                    <line x1="0" y1="0" x2="20" y2="-45" stroke="#78350F" strokeWidth="0.8" />
                    <circle cx="0" cy="-28" r="4.5" fill="#FAF9F5" opacity="0.85" />
                    <circle cx="0" cy="0" r="2.5" fill="#B45309" />
                    <path d="M 0,0 Q 4,14 2,24" stroke="#DC2626" strokeWidth="2" fill="none" />
                  </g>
                )}

                {/* 5. Hoa Cài Tóc Dát Vàng */}
                {(tType.includes('hoa_cai') || lId.includes('hoa') || tType.includes('hoa')) && (
                  <g id="prop-hoa-cai">
                    <circle cx="0" cy="0" r="3.5" fill="#F59E0B" stroke="#78350F" strokeWidth="0.8" />
                    <path d="M 0,-4 Q -3,-10 0,-12 Q 3,-10 0,-4" fill="#FBBF24" stroke="#D97706" strokeWidth="0.6" />
                    <path d="M 4,-2 Q 10,-4 12,0 Q 8,3 4,-2" fill="#FBBF24" stroke="#D97706" strokeWidth="0.6" />
                    <path d="M 2,4 Q 6,10 2,12 Q -2,8 2,4" fill="#FBBF24" stroke="#D97706" strokeWidth="0.6" />
                    <path d="M -2,4 Q -6,10 -2,12 Q 2,8 -2,4" fill="#FBBF24" stroke="#D97706" strokeWidth="0.6" />
                    <path d="M -4,-2 Q -10,-4 -12,0 Q -8,3 -4,-2" fill="#FBBF24" stroke="#D97706" strokeWidth="0.6" />
                    <circle cx="0" cy="0" r="1.8" fill="#FFFFFF" />
                  </g>
                )}

                {/* 6. Kính Râm Oval Retro / Kính Mắt */}
                {(tType.includes('kinh') || lId.includes('eyewear')) && (
                  <g id="prop-kinh-ram" fill="#0F172A" stroke="#D97706" strokeWidth="1.2">
                    <ellipse cx="-10" cy="0" rx="7.5" ry="4.5" />
                    <ellipse cx="10" cy="0" rx="7.5" ry="4.5" />
                    <line x1="-3" y1="0" x2="3" y2="0" stroke="#D97706" strokeWidth="1.5" />
                    <line x1="-17" y1="0" x2="-28" y2="-2" stroke="#D97706" strokeWidth="1" />
                    <line x1="17" y1="0" x2="28" y2="-2" stroke="#D97706" strokeWidth="1" />
                  </g>
                )}

                {/* 7. Canvas Tote Bag (Smooth Curved Crossbody Strap wrapping shoulder & torso) */}
                {(tType.includes('tote') || tType.includes('canvas') || lId.includes('canvas') || (lId.includes('bag') && !tType.includes('baguette') && !tType.includes('gam'))) && (
                  <g id="prop-canvas-tote">
                    <path d="M 30,-135 Q 20,-65 -5,0" stroke="#78716C" strokeWidth="2.8" fill="none" />
                    <rect x="-20" y="-5" width="38" height="52" rx="4" fill="#FAF9F5" stroke="#D6D3D1" strokeWidth="1.5" />
                    <path d="M -13,15 Q -1,5 11,15" stroke="#991B1B" strokeWidth="2" fill="none" />
                    <line x1="-9" y1="28" x2="7" y2="28" stroke="#0F172A" strokeWidth="1" />
                  </g>
                )}

                {/* 8. Baguette Bag Da */}
                {(tType.includes('baguette') || lId.includes('baguette')) && (
                  <g id="prop-baguette-bag">
                    <path d="M -20,-25 Q -5,-12 0,10" stroke="#0F172A" strokeWidth="2.5" fill="none" />
                    <rect x="-15" y="5" width="32" height="18" rx="4" fill="#1C1917" stroke="#D97706" strokeWidth="1" />
                    <circle cx="1" cy="14" r="2" fill="#D97706" />
                  </g>
                )}

                {/* 9. Túi Gấm Cung Đình */}
                {(tType.includes('tui_gam') || lId.includes('tui_gam')) && (
                  <g id="prop-tui-gam">
                    <path d="M 20,-140 Q 10,-70 -5,0" stroke="#D97706" strokeWidth="2" fill="none" strokeDasharray="3 2" />
                    <path d="M -18,0 Q -22,25 0,34 Q 22,25 18,0 Z" fill={dynLayer.color || "#B45309"} stroke="#78350F" strokeWidth="1.2" />
                    <ellipse cx="0" cy="0" rx="18" ry="4" fill="#78350F" />
                    <circle cx="0" cy="34" r="2" fill="#F59E0B" />
                    <path d="M 0,36 L 0,48" stroke="#DC2626" strokeWidth="2.5" />
                  </g>
                )}

                {/* 10. Chuỗi Hạt Ngọc Bích */}
                {(tType.includes('chuoi_ngoc') || lId.includes('chuoi')) && (
                  <g id="prop-chuoi-ngoc" fill="#059669" stroke="#047857" strokeWidth="0.5">
                    <circle cx="-8" cy="-5" r="2.2" />
                    <circle cx="-4" cy="0" r="2.2" />
                    <circle cx="0" cy="2" r="2.5" />
                    <circle cx="4" cy="0" r="2.2" />
                    <circle cx="8" cy="-5" r="2.2" />
                  </g>
                )}

                {/* 11. Kim Khánh & Thẻ Bài */}
                {(tType.includes('the_bai') || tType.includes('kim_khanh') || lId.includes('kim_khanh') || (lId.includes('jewelry') && !tType.includes('chuoi'))) && (
                  <g id="prop-kim-khanh">
                    <rect x="-5" y="-15" width="10" height="20" rx="2" fill={dynLayer.color || "#B45309"} stroke="#78350F" strokeWidth="1" />
                    <circle cx="0" cy="-10" r="1.5" fill="#FEF3C7" />
                    <path d="M 0,5 L 0,20" stroke="#DC2626" strokeWidth="2" />
                  </g>
                )}

                {/* 12. Footwear (Giày Sneaker / Chelsea Boots / Hài Thêu) */}
                {(tType.includes('sneaker') || tType.includes('chunky') || tType.includes('boot') || tType.includes('chelsea') || tType.includes('hai') || lId.includes('footwear')) && (
                  <g id="prop-footwear">
                    {(tType.includes('boot') || tType.includes('chelsea')) ? (
                      <g id="prop-chelsea-boots">
                        <path d="M -38,-18 L -46,10 L -14,11 L -18,-18 Z" fill="#0F172A" stroke="#334155" strokeWidth="1" />
                        <path d="M 18,-18 L 14,11 L 46,10 L 38,-18 Z" fill="#0F172A" stroke="#334155" strokeWidth="1" />
                      </g>
                    ) : (tType.includes('hai') || tType.includes('phuong')) ? (
                      <g id="prop-hai-theu">
                        <path d="M -38,-5 Q -42,5 -24,7 L -12,7 Q -8,-3 -16,-7 Z" fill="#991B1B" />
                        <path d="M 12,-7 Q 8,-3 16,7 L 28,7 Q 42,5 38,-5 Z" fill="#991B1B" />
                      </g>
                    ) : (
                      <g id="prop-chunky-sneakers">
                        <path d="M -40,-10 L -50,7 L -14,10 L -12,-9 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                        <rect x="-52" y="5" width="40" height="8" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
                        <path d="M 12,-9 L 14,10 L 50,7 L 40,-10 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                        <rect x="12" y="5" width="40" height="8" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
                      </g>
                    )}
                  </g>
                )}

                {/* BOUNDING BOX DISPLAY WHEN SELECTED WITH INTERACTIVE SWIPE SURFACE */}
                {isSelected && !readOnly && (
                  <g id="bounding-box-ui">
                    {/* Background drag hit area */}
                    <rect
                      x={-boxW / 2}
                      y={-boxH / 2}
                      width={boxW}
                      height={boxH}
                      fill={isDraggingThis ? "rgba(6,182,212,0.25)" : "rgba(6,182,212,0.09)"}
                      stroke="#06B6D4"
                      strokeWidth={isDraggingThis ? "2" : "1.5"}
                      strokeDasharray="4 3"
                      rx="4"
                      style={{ cursor: isDraggingItem ? 'grabbing' : 'grab', touchAction: 'none' }}
                      onPointerDown={(e) => handleItemPointerDown(e, dynLayer.id)}
                      onTouchStart={(e) => handleItemTouchStart(e, dynLayer.id)}
                    />

                    {/* Corner resize & drag handles (Interactive click to scale / rotate) */}
                    <circle
                      cx={-boxW / 2}
                      cy={-boxH / 2}
                      r="4.5"
                      fill="#06B6D4"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      className="cursor-pointer hover:scale-125 transition-transform"
                      onClick={(e) => { e.stopPropagation(); modifyTransform({ rotation: -15 }); }}
                    >
                      <title>Click để xoay ngược chiều kim đồng hồ</title>
                    </circle>
                    <circle
                      cx={boxW / 2}
                      cy={-boxH / 2}
                      r="4.5"
                      fill="#06B6D4"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      className="cursor-pointer hover:scale-125 transition-transform"
                      onClick={(e) => { e.stopPropagation(); modifyTransform({ scale: 0.1 }); }}
                    >
                      <title>Click để phóng to</title>
                    </circle>
                    <circle
                      cx={boxW / 2}
                      cy={boxH / 2}
                      r="4.5"
                      fill="#06B6D4"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      className="cursor-pointer hover:scale-125 transition-transform"
                      onClick={(e) => { e.stopPropagation(); modifyTransform({ scale: -0.1 }); }}
                    >
                      <title>Click để thu nhỏ</title>
                    </circle>
                    <circle
                      cx={-boxW / 2}
                      cy={boxH / 2}
                      r="4.5"
                      fill="#06B6D4"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      className="cursor-pointer hover:scale-125 transition-transform"
                      onClick={(e) => { e.stopPropagation(); modifyTransform({ rotation: 15 }); }}
                    >
                      <title>Click để xoay theo chiều kim đồng hồ</title>
                    </circle>

                    {/* Top rotation stem & handle */}
                    <line x1="0" y1={-boxH / 2} x2="0" y2={-boxH / 2 - 14} stroke="#06B6D4" strokeWidth="1.5" />
                    <circle
                      cx="0"
                      cy={-boxH / 2 - 14}
                      r="5"
                      fill="#06B6D4"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      className="cursor-pointer hover:scale-125 transition-transform"
                      onClick={(e) => { e.stopPropagation(); modifyTransform({ rotation: 15 }); }}
                    >
                      <title>Click để xoay góc phụ kiện</title>
                    </circle>

                    {/* Quick Swipe Indicator Label */}
                    <g transform={`translate(0, ${boxH / 2 + 13})`}>
                      <rect x="-38" y="-8" width="76" height="15" rx="7" fill="rgba(15,23,42,0.85)" stroke="#06B6D4" strokeWidth="0.8" />
                      <text x="0" y="3" textAnchor="middle" fill="#22D3EE" fontSize="7.5" fontWeight="bold">
                        {isDraggingThis ? "Đang vuốt..." : "Vuốt / Kéo góc"}
                      </text>
                    </g>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* DOCKED ACCESSORY EDIT PANEL OUTSIDE MANNEQUIN IMAGE FRAME */}
      {activeSelectedLayer && !readOnly ? (
        <div className="w-full max-w-[420px] mt-2.5 z-40 bg-stone-900/95 text-stone-100 p-2.5 rounded-xl shadow-2xl border border-stone-700/80 backdrop-blur-md flex flex-col gap-2 shrink-0 animate-fadeIn">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-stone-800">
            <div className="flex items-center gap-1.5 font-bold truncate">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-300 truncate">{activeSelectedLayer.name}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-cyan-400/90 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/50 mr-1">
                <Hand className="w-3 h-3 text-cyan-400" />
                <span>Vuốt để di chuyển</span>
              </div>
              {onToggleLayerLock && (
                <button
                  type="button"
                  onClick={() => onToggleLayerLock(activeSelectedLayer.id)}
                  title={activeSelectedLayer.locked ? "Mở khóa layer" : "Khóa layer"}
                  className={`p-1 rounded hover:bg-stone-800 cursor-pointer ${activeSelectedLayer.locked ? 'text-amber-400' : 'text-stone-400'}`}
                >
                  {activeSelectedLayer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              )}
              {onToggleLayerVisibility && (
                <button
                  type="button"
                  onClick={() => onToggleLayerVisibility(activeSelectedLayer.id)}
                  title={activeSelectedLayer.visible ? "Ẩn layer" : "Hiện layer"}
                  className="p-1 rounded hover:bg-stone-800 cursor-pointer text-stone-400 hover:text-stone-200"
                >
                  {activeSelectedLayer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              )}
              {onRemoveLayer && (
                <button
                  type="button"
                  onClick={() => onRemoveLayer(activeSelectedLayer.id)}
                  title="Xóa phụ kiện này"
                  className="p-1 rounded hover:bg-red-950/60 cursor-pointer text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onSelectLayer && (
                <button
                  type="button"
                  onClick={() => onSelectLayer(null)}
                  title="Đóng Bounding Box"
                  className="p-1 rounded hover:bg-stone-800 cursor-pointer text-stone-400 hover:text-stone-200 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Scale, Rotate, Move controls */}
          <div className="flex items-center justify-between gap-1 text-[11px]">
            {/* Scale Controls */}
            <div className="flex items-center gap-1 bg-stone-800/80 px-2 py-1 rounded-lg">
              <span className="text-stone-400 font-semibold text-[10px]">Cỡ:</span>
              <button
                type="button"
                onClick={() => modifyTransform({ scale: -0.1 })}
                className="px-1.5 py-0.5 rounded bg-stone-700 hover:bg-stone-600 font-bold cursor-pointer"
                title="Thu nhỏ"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => modifyTransform({ scale: 0.1 })}
                className="px-1.5 py-0.5 rounded bg-stone-700 hover:bg-stone-600 font-bold cursor-pointer"
                title="Phóng to"
              >
                +
              </button>
            </div>

            {/* Rotation Controls */}
            <div className="flex items-center gap-1 bg-stone-800/80 px-2 py-1 rounded-lg">
              <span className="text-stone-400 font-semibold text-[10px]">Xoay:</span>
              <button
                type="button"
                onClick={() => modifyTransform({ rotation: -15 })}
                className="px-1.5 py-0.5 rounded bg-stone-700 hover:bg-stone-600 cursor-pointer"
                title="Xoay ngược chiều kim đồng hồ"
              >
                ⟲
              </button>
              <button
                type="button"
                onClick={() => modifyTransform({ rotation: 15 })}
                className="px-1.5 py-0.5 rounded bg-stone-700 hover:bg-stone-600 cursor-pointer"
                title="Xoay theo chiều kim đồng hồ"
              >
                ⟳
              </button>
            </div>

            {/* Position Nudge */}
            <div className="flex items-center gap-1 bg-stone-800/80 px-2 py-1 rounded-lg">
              <span className="text-stone-400 font-semibold text-[10px]">Dịch:</span>
              <button
                type="button"
                onClick={() => modifyTransform({ x: -4 })}
                className="px-1 py-0.5 rounded bg-stone-700 hover:bg-stone-600 cursor-pointer"
                title="Sang trái"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => modifyTransform({ y: -4 })}
                className="px-1 py-0.5 rounded bg-stone-700 hover:bg-stone-600 cursor-pointer"
                title="Lên trên"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => modifyTransform({ y: 4 })}
                className="px-1 py-0.5 rounded bg-stone-700 hover:bg-stone-600 cursor-pointer"
                title="Xuống dưới"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => modifyTransform({ x: 4 })}
                className="px-1 py-0.5 rounded bg-stone-700 hover:bg-stone-600 cursor-pointer"
                title="Sang phải"
              >
                →
              </button>
            </div>

            {/* Reset */}
            <button
              type="button"
              onClick={resetTransform}
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] cursor-pointer"
              title="Khôi phục vị trí chuẩn"
            >
              Đặt lại
            </button>
          </div>
        </div>
      ) : !readOnly ? (
        <div className="w-full max-w-[420px] mt-2.5 py-1.5 px-3 rounded-xl bg-stone-900/40 border border-stone-800/60 text-[11px] text-stone-400 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5 truncate text-[10.5px]">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Nhấp trực tiếp vào phụ kiện/trang phục để xoay, thu phóng & tùy chỉnh</span>
          </span>
        </div>
      ) : null}

      {/* Interactive Quick-Toggles beneath Canvas */}
      {showControls && !readOnly && (
        <div className="w-full mt-2.5 flex items-center justify-between text-xs text-stone-400 px-1">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isRightOverLeft ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
            <span className="font-medium text-stone-300">
              {isRightOverLeft ? 'Quy chuẩn: Hữu nhiệm' : 'Cảnh báo: Tả nhiệm'}
            </span>
          </div>

          <div className="text-stone-500 text-[11px]">
            {dynamicLayers?.length ? `${dynamicLayers.length} Layers Động` : '5 Lớp Y Phục'} · Chuẩn Đại Việt
          </div>
        </div>
      )}
    </div>
  );
};

