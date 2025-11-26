// Типы для тамагочи

export type PetId = string;
export type ItemId = string;
export type ShopCategory = 'pets' | 'hats' | 'shoes';

export interface Pet {
  id: PetId;
  name: string;
  emoji: string; // Тело питомца
  happiness: number; // 0-100
  fullness: number; // 0-100
  equippedHat?: ItemId;
  equippedShoes?: ItemId;
}

export interface ShopItem {
  id: ItemId;
  name: string;
  emoji: string;
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

