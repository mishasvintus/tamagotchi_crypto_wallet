import type { ActivityItem } from '@/tamagotchi/types';

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  { id: 'activity-game', name: 'Игра', emoji: '🎮', currencyReward: 3, restoreAmount: 15 },
  { id: 'activity-dart', name: 'Дартс', emoji: '🎯', currencyReward: 5, restoreAmount: 15 },
  { id: 'activity-dice', name: 'Кости', emoji: '🎲', currencyReward: 4, restoreAmount: 15 },
  { id: 'activity-art', name: 'Рисование', emoji: '🎨', currencyReward: 6, restoreAmount: 15 },
];

