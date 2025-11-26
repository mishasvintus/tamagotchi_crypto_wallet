// Типы для тамагочи

export type PetId = string;
export type ItemId = string;
export type ShopCategory = 'pets' | 'hats' | 'shoes';

// Конфигурация позиционирования аксессуаров для конкретного питомца
export interface PetAccessoryConfig {
  // Конфигурация шляпы
  hat?: {
    x: number; // Позиция по X в процентах от размера питомца (0-100)
    y: number; // Позиция по Y в процентах от размера питомца (0-100)
    scale: number; // Масштаб аксессуара (1.0 = 100%)
    rotation?: number; // Поворот в градусах (опционально)
  };
  // Конфигурация левого ботинка
  leftShoe?: {
    x: number;
    y: number;
    scale: number;
    rotation?: number;
  };
  // Конфигурация правого ботинка
  rightShoe?: {
    x: number;
    y: number;
    scale: number;
    rotation?: number;
  };
}

export interface Pet {
  id: PetId;
  name: string;
  emoji: string; // Тело питомца (fallback для старых данных)
  imageUrl?: string; // URL изображения питомца (SVG или PNG)
  happiness: number; // 0-100
  fullness: number; // 0-100
  equippedHat?: ItemId;
  equippedShoes?: ItemId;
  accessoryConfig?: PetAccessoryConfig; // Конфигурация позиционирования аксессуаров
}

export interface ShopItem {
  id: ItemId;
  name: string;
  emoji: string; // Fallback для старых данных
  imageUrl?: string; // URL изображения аксессуара (SVG или PNG)
  category: ShopCategory;
  price: number;
  owned: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  currencyReward: number;
  restoreAmount: number; // Сколько восстанавливает из 100
}

export interface ActivityItem {
  id: string;
  name: string;
  emoji: string;
  currencyReward: number;
  restoreAmount: number; // Сколько восстанавливает из 100
}

export interface TamagotchiState {
  currentPet: Pet;
  currency: number;
  ownedPets: PetId[];
  ownedItems: ItemId[];
  shopItems: ShopItem[];
}

