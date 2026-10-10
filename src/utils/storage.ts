import { GarmentLayerState, MannequinSettings, SavedOutfit } from '../types';

const DRAFT_STORAGE_KEY = 'vpr_current_draft_v1';
const OUTFITS_STORAGE_KEY = 'vpr_saved_outfits_v1';
const POINTS_STORAGE_KEY = 'vpr_heritage_points_v1';

export interface StorageDraft {
  layers: GarmentLayerState;
  mannequin: MannequinSettings;
  lastSavedAt: string;
}

export function saveDraftLocally(layers: GarmentLayerState, mannequin: MannequinSettings): void {
  try {
    const payload: StorageDraft = {
      layers,
      mannequin,
      lastSavedAt: new Date().toISOString()
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

export function loadDraftLocally(): StorageDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.layers && parsed.mannequin) {
      return parsed as StorageDraft;
    }
  } catch (e) {
    console.warn('LocalStorage parse error, clearing corrupt draft:', e);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }
  return null;
}

export function saveOutfitsLocally(outfits: SavedOutfit[]): void {
  try {
    localStorage.setItem(OUTFITS_STORAGE_KEY, JSON.stringify(outfits));
  } catch (e) {
    console.warn('Failed to persist outfits locally:', e);
  }
}

export function loadOutfitsLocally(defaultOutfits: SavedOutfit[]): SavedOutfit[] {
  try {
    const raw = localStorage.getItem(OUTFITS_STORAGE_KEY);
    if (!raw) return defaultOutfits;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse outfits from storage:', e);
  }
  return defaultOutfits;
}

export function savePointsLocally(points: number): void {
  try {
    localStorage.setItem(POINTS_STORAGE_KEY, points.toString());
  } catch (e) {
    // Ignore storage quota errors
  }
}

export function loadPointsLocally(defaultPoints: number): number {
  try {
    const raw = localStorage.getItem(POINTS_STORAGE_KEY);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch (e) {
    // Return default
  }
  return defaultPoints;
}
