import type { FoodItem } from '@/tamagotchi/types';

export const INITIAL_FOOD: FoodItem[] = [
  { id: 'food-apple', name: 'Яблоко', emoji: '🍎', currencyReward: 2, restoreAmount: 20 },
  { id: 'food-pizza', name: 'Пицца', emoji: '🍕', currencyReward: 5, restoreAmount: 20 },
  { id: 'food-cake', name: 'Торт', emoji: '🍰', currencyReward: 8, restoreAmount: 20 },
  { id: 'food-meat', name: 'Мясо', emoji: '🥩', currencyReward: 10, restoreAmount: 20 },
];

