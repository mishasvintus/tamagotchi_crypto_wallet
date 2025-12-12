import type { ShopItem } from '@/tamagotchi/types';

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  { id: 'pet-cat', name: 'Cat', emoji: '🐱', imageUrl: '/assets/pets/cat.png', category: 'pets', price: 0, owned: true },
  { id: 'pet-dog', name: 'Dog', emoji: '🐶', imageUrl: '/assets/pets/dog.png', category: 'pets', price: 150, owned: false },
  { id: 'pet-fox', name: 'Fox', emoji: '🦊', imageUrl: '/assets/pets/fox.png', category: 'pets', price: 180, owned: false },
  { id: 'pet-cow', name: 'Cow', emoji: '🐮', imageUrl: '/assets/pets/cow.png', category: 'pets', price: 200, owned: false },
  { id: 'pet-dragon', name: 'Dragon', emoji: '🐉', imageUrl: '/assets/pets/dragon.png', category: 'pets', price: 300, owned: false },
  { id: 'pet-vampire', name: 'Vampire', emoji: '🧛', imageUrl: '/assets/pets/vampire.png', category: 'pets', price: 350, owned: false },
  
  { id: 'hat-none', name: 'Без шляпы', emoji: '', category: 'hats', price: 0, owned: true },
  { 
    id: 'hat-cap', 
    name: 'Кепка', 
    emoji: '🧢', 
    imageUrl: '/assets/hats/hat_cap.png', 
    category: 'hats', 
    price: 50, 
    owned: false,
    accessoryConfig: { x: 46, y: 15, scale: 0.6 } 
  },
  { 
    id: 'hat-kotelok', 
    name: 'Котелок', 
    emoji: '🎩', 
    imageUrl: '/assets/hats/hat_kotelok.png', 
    category: 'hats', 
    price: 75, 
    owned: false,
    accessoryConfig: { x: 49, y: 12, scale: 0.5 }
  },
  { 
    id: 'hat-flowers', 
    name: 'Цветы', 
    emoji: '🌸', 
    imageUrl: '/assets/hats/hat_flowers.png', 
    category: 'hats', 
    price: 60, 
    owned: false,
    accessoryConfig: { x: 48, y: 19, scale: 0.7 }
  },
  { 
    id: 'hat-kandibober', 
    name: 'Кандибобер', 
    emoji: '🎩', 
    imageUrl: '/assets/hats/hat_kandibober.png', 
    category: 'hats', 
    price: 80, 
    owned: false,
    accessoryConfig: { x: 50, y: 12, scale: 0.5 }
  },
  { 
    id: 'hat-viking', 
    name: 'Викинг', 
    emoji: '⚔️', 
    imageUrl: '/assets/hats/hat_viking.png', 
    category: 'hats', 
    price: 90, 
    owned: false,
    accessoryConfig: { x: 50, y: 10, scale: 0.5 }
  },
  { 
    id: 'hat-cylinder', 
    name: 'Цилиндр', 
    emoji: '🎩', 
    imageUrl: '/assets/hats/hat_cylinder.png', 
    category: 'hats', 
    price: 100, 
    owned: false,
    accessoryConfig: { x: 50, y: 10, scale: 0.5 }
  },
  
  { id: 'shoes-sneakers', name: 'Кроссовки', emoji: '👟', category: 'shoes', price: 60, owned: false },
  { id: 'shoes-boots', name: 'Сапоги', emoji: '👢', category: 'shoes', price: 80, owned: false },
];

