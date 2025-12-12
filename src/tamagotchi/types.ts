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
  // Конфигурация пары ботинок
  shoes?: {
    x: number; // Сдвиг влево/вправо (центр пары ботинок) в процентах (0-100)
    y: number; // Высота по вертикали в процентах (0-100)
    gap: number; // Расстояние между ботинками в процентах (0-100)
    scale: number; // Масштабирование пары ботинок (1.0 = 100%)
    rotation?: number; // Наклон ботинок в градусах (общий для обоих, опционально)
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
  scale?: number; // Масштаб тела питомца (1.0 = 100%, по умолчанию 1.0)
  verticalOffset?: number; // Вертикальное смещение спрайта в процентах (положительное = вниз, отрицательное = вверх, по умолчанию 0)
}

// Конфигурация позиционирования для отдельного аксессуара
export interface AccessoryPositionConfig {
  x: number; // Позиция по X в процентах (0-100)
  y: number; // Позиция по Y в процентах (0-100)
  scale: number; // Масштаб (1.0 = 100%)
  rotation?: number; // Поворот в градусах (опционально)
  gap?: number; // Расстояние между ботинками в процентах (только для shoes, опционально)
}

export interface ShopItem {
  id: ItemId;
  name: string;
  emoji: string; // Fallback для старых данных
  imageUrl?: string; // URL изображения аксессуара (SVG или PNG)
  category: ShopCategory;
  price: number;
  owned: boolean;
  accessoryConfig?: AccessoryPositionConfig; // Индивидуальная конфигурация позиционирования для аксессуара
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

