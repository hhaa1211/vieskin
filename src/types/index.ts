export type GarmentFamily = 
  | 'ao_giao_linh' 
  | 'ao_tu_than' 
  | 'ao_ngu_than_chen' 
  | 'ao_tac' 
  | 'ao_nhat_binh' 
  | 'ao_dai'
  | 'ao_ba_ba'
  | 'ao_tho_cam'
  | 'ao_cham';

export type OccasionContext = 
  | 'gala_formal' 
  | 'yearbook_graduation' 
  | 'streetwear_cafe' 
  | 'folk_festival' 
  | 'lunar_new_year';

export type GeographicRegion = 
  | 'north' 
  | 'central' 
  | 'south' 
  | 'all';

export type FiveElement = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';

export type LapelDirection = 'right_over_left' | 'left_over_right'; // Hữu nhiệm (chuẩn) vs Tả nhiệm

export interface GarmentLore {
  id: string;
  name: string;
  family: GarmentFamily;
  era: string;
  region: GeographicRegion;
  suitableOccasions: OccasionContext[];
  originalRank: string;
  etiquetteRules: string[];
  patternSymbolism: string[];
  description: string;
  historicalContext: string;
  defaultColors: {
    robe: string;
    collar: string;
    trim?: string;
  };
  fiveElement: FiveElement;
  imageSilhouette: string;
}

export type LayerCategory = 'inner' | 'bottom' | 'outer' | 'trad_accessory' | 'modern_accessory' | 'prop';

export interface DynamicLayerItem {
  id: string;
  category: LayerCategory;
  name: string;
  type?: string;
  visible: boolean;
  locked: boolean;
  color?: string;
  collarColor?: string;
  trimColor?: string;
  patternType?: 'thuy_ba' | 'van_may' | 'hoa_cuc' | 'sen' | 'plain';
  lapelDirection?: LapelDirection;
  family?: GarmentFamily;
  // Bounding Box Transform on Canvas
  transform?: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  aiCollarMasking?: boolean;
}

export interface GarmentLayerState {
  layer1_inner: {
    id: string;
    name: string;
    color: string;
    visible: boolean;
  };
  layer2_bottom: {
    id: string;
    name: string;
    color: string;
    type: 'trousers' | 'skirt' | 'culottes';
  };
  layer3_outer: {
    id: string;
    name: string;
    family: GarmentFamily;
    robeColor: string;
    collarColor: string;
    trimColor: string;
    patternType: 'thuy_ba' | 'van_may' | 'hoa_cuc' | 'sen' | 'plain';
    lapelDirection: LapelDirection;
  };
  layer4_tradAccessory: {
    headwearId?: string;
    headwearName?: string;
    headwearColor?: string;
    jewelryId?: string;
    jewelryName?: string;
    footwearId?: string;
    footwearName?: string;
  };
  layer5_modernAccessory: {
    footwearId?: string;
    footwearName?: string;
    eyewearId?: string;
    eyewearName?: string;
    bagId?: string;
    bagName?: string;
  };
  // Dynamic Layers Extension for Layers Panel & Canvas Bounding Box
  dynamicLayers?: DynamicLayerItem[];
  enableAiFusion?: boolean;
}

export interface MannequinSettings {
  bodyProportion: 'slim' | 'balanced' | 'athletic';
  skinTone: string; // hex
  genderPresentation: 'female' | 'male' | 'androgynous';
  faceImageUri?: string;
  heightScale: number; // 0.9 to 1.1
}

export interface EtiquetteAuditResult {
  isAuthentic: boolean;
  score: number;
  issues: {
    severity: 'critical' | 'warning' | 'info';
    code: string;
    title: string;
    description: string;
    solution: string;
  }[];
  guidance: string;
}

export interface SavedOutfit {
  id: string;
  title: string;
  concept: string;
  createdAt: string;
  occasion: OccasionContext;
  layers: GarmentLayerState;
  mannequin: MannequinSettings;
  fiveElementHarmony: {
    element: FiveElement;
    score: number;
    explanation: string;
  };
  etiquetteScore: number;
  likesCount: number;
}

export interface CulturalBadge {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'accuracy' | 'creativity' | 'knowledge' | 'remix';
  unlocked: boolean;
  unlockedAt?: string;
  requiredPoints: number;
  iconName: string;
}

export interface TrendingRemixItem {
  id: string;
  title: string;
  author: string;
  avatar: string;
  description: string;
  tags: string[];
  garmentName: string;
  modernItems: string[];
  likes: number;
  preset: {
    family: GarmentFamily;
    robeColor: string;
    collarColor: string;
    innerColor: string;
    bottomColor: string;
    tradHead: string;
    modFoot: string;
    modEye: string;
    modBag: string;
  };
}

export interface ExtractedAsset {
  id: string;
  name: string;
  sourceType: 'uploaded' | 'curated';
  imageUrl: string;
  dominantColors: string[];
  fiveElement: FiveElement;
  detectedPattern: string;
  category: 'fabric' | 'motif' | 'garment';
  createdAt: string;
}
