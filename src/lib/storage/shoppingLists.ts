import { NutriScoreGrade, NovaGroup, AnalysisResult } from '../../types/nutrition';

export interface FavoriteItem {
  id: string;
  productName: string;
  brand?: string;
  grade: NutriScoreGrade;
  novaGroup: NovaGroup;
  imagePreview?: string;
  analysis?: AnalysisResult;
  addedAt: string;
}

export interface ShoppingListItem {
  id: string;
  productName: string;
  brand?: string;
  grade: NutriScoreGrade;
  novaGroup: NovaGroup;
  category?: string;
  isChecked: boolean;
  addedAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: string;
  items: ShoppingListItem[];
}

const FAVORITES_KEY = 'nutrigrade_user_favorites';
const LISTS_KEY = 'nutrigrade_shopping_lists';

// DEFAULT PRE-LOADED STAPLES LIST FOR INITIAL DEMO EXPERIENCE
const DEFAULT_SHOPPING_LIST: ShoppingList = {
  id: 'list_default_healthy_staples',
  name: 'NutriGrade Healthy Grocery Staples',
  createdAt: new Date().toISOString(),
  items: [
    {
      id: 'item_1',
      productName: 'Organic Rolled Oats & Seed Mix',
      brand: 'Quaker',
      grade: 'A',
      novaGroup: 1,
      category: 'Cereals & Grains',
      isChecked: false,
      addedAt: new Date().toISOString(),
    },
    {
      id: 'item_2',
      productName: 'Plain Greek Yogurt 0% Fat',
      brand: 'Chobani',
      grade: 'A',
      novaGroup: 1,
      category: 'Dairy & Eggs',
      isChecked: true,
      addedAt: new Date().toISOString(),
    },
    {
      id: 'item_3',
      productName: '100% Pure Almond & Flax Butter',
      brand: 'Whole Foods',
      grade: 'B',
      novaGroup: 2,
      category: 'Spreads',
      isChecked: false,
      addedAt: new Date().toISOString(),
    },
    {
      id: 'item_4',
      productName: 'Sparkling Lemon Mineral Water',
      brand: 'San Pellegrino',
      grade: 'A',
      novaGroup: 1,
      category: 'Beverages',
      isChecked: false,
      addedAt: new Date().toISOString(),
    },
  ],
};

// ── FAVORITES STORE ─────────────────────────────────────────────────────────

export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FavoriteItem[];
  } catch {
    return [];
  }
}

export function isFavorite(productIdOrName: string): boolean {
  const favorites = getFavorites();
  const clean = productIdOrName.trim().toLowerCase();
  return favorites.some(
    (f) => f.id.toLowerCase() === clean || f.productName.toLowerCase() === clean
  );
}

export function toggleFavorite(product: {
  id?: string;
  productName: string;
  brand?: string;
  grade: NutriScoreGrade;
  novaGroup: NovaGroup;
  imagePreview?: string;
  analysis?: AnalysisResult;
}): boolean {
  if (typeof window === 'undefined') return false;

  const favorites = getFavorites();
  const targetId = product.id || product.productName;
  const existingIdx = favorites.findIndex(
    (f) =>
      f.id.toLowerCase() === targetId.toLowerCase() ||
      f.productName.toLowerCase() === product.productName.toLowerCase()
  );

  let nowFavorite = false;

  if (existingIdx >= 0) {
    // Remove from favorites
    favorites.splice(existingIdx, 1);
    nowFavorite = false;
  } else {
    // Add to favorites
    const newFav: FavoriteItem = {
      id: targetId,
      productName: product.productName,
      brand: product.brand || 'Food Product',
      grade: product.grade,
      novaGroup: product.novaGroup,
      imagePreview: product.imagePreview || '',
      analysis: product.analysis,
      addedAt: new Date().toISOString(),
    };
    favorites.unshift(newFav);
    nowFavorite = true;
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return nowFavorite;
}

// ── SHOPPING LISTS STORE ───────────────────────────────────────────────────

export function getLists(): ShoppingList[] {
  if (typeof window === 'undefined') return [DEFAULT_SHOPPING_LIST];
  try {
    const raw = localStorage.getItem(LISTS_KEY);
    if (!raw) {
      localStorage.setItem(LISTS_KEY, JSON.stringify([DEFAULT_SHOPPING_LIST]));
      return [DEFAULT_SHOPPING_LIST];
    }
    const parsed = JSON.parse(raw) as ShoppingList[];
    return parsed.length > 0 ? parsed : [DEFAULT_SHOPPING_LIST];
  } catch {
    return [DEFAULT_SHOPPING_LIST];
  }
}

export function createList(name: string): ShoppingList {
  const lists = getLists();
  const newList: ShoppingList = {
    id: `list_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || 'Custom Healthy Shopping List',
    createdAt: new Date().toISOString(),
    items: [],
  };

  lists.unshift(newList);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  }

  return newList;
}

export function deleteList(listId: string): void {
  const lists = getLists().filter((l) => l.id !== listId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  }
}

export function addToList(
  listId: string,
  product: {
    productName: string;
    brand?: string;
    grade?: NutriScoreGrade;
    novaGroup?: NovaGroup;
    category?: string;
  }
): ShoppingList | null {
  const lists = getLists();
  const targetList = lists.find((l) => l.id === listId);

  if (!targetList) return null;

  const newItem: ShoppingListItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    productName: product.productName,
    brand: product.brand || '',
    grade: product.grade || 'A',
    novaGroup: product.novaGroup || 1,
    category: product.category || 'General Groceries',
    isChecked: false,
    addedAt: new Date().toISOString(),
  };

  targetList.items.push(newItem);

  if (typeof window !== 'undefined') {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  }

  return targetList;
}

export function removeFromList(listId: string, itemId: string): ShoppingList | null {
  const lists = getLists();
  const targetList = lists.find((l) => l.id === listId);

  if (!targetList) return null;

  targetList.items = targetList.items.filter((i) => i.id !== itemId);

  if (typeof window !== 'undefined') {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  }

  return targetList;
}

export function toggleListItemChecked(listId: string, itemId: string): ShoppingList | null {
  const lists = getLists();
  const targetList = lists.find((l) => l.id === listId);

  if (!targetList) return null;

  const item = targetList.items.find((i) => i.id === itemId);
  if (item) {
    item.isChecked = !item.isChecked;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  }

  return targetList;
}

/**
 * Formats a shopping list into a clean shareable plain text string for SMS / WhatsApp.
 */
export function exportListAsText(listId: string): string {
  const lists = getLists();
  const targetList = lists.find((l) => l.id === listId);

  if (!targetList) return '';

  const header = `🛒 ${targetList.name.toUpperCase()}\nNutriGrade AI Verified Healthy Grocery List\n-----------------------------------------`;
  const itemsText = targetList.items
    .map((i) => `${i.isChecked ? '✓ [DONE]' : '☐ [ ]'} ${i.productName} (Grade ${i.grade}, NOVA ${i.novaGroup})`)
    .join('\n');

  const footer = `\n-----------------------------------------\nExported from NutriGrade AI - Science-Backed Food Analyzer`;
  return `${header}\n${itemsText}${footer}`;
}
