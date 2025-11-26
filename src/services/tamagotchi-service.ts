import type { 
  Pet, 
  ShopItem, 
  FoodItem, 
  ActivityItem, 
  ShopCategory,
  TamagotchiState 
} from '@/tamagotchi/types';

// Начальные данные игры
const INITIAL_PETS: Pet[] = [
  {
    id: 'cat-1',
    name: 'Sad Boy',
    emoji: '🐱', // Fallback
    imageUrl: '/assets/pets/sad_boy.png',
    happiness: 80,
    fullness: 70,
    accessoryConfig: {
      // Конфигурация будет добавлена позже, когда появятся аксессуары
      hat: { x: 50, y: 10, scale: 0.8 },
      leftShoe: { x: 35, y: 85, scale: 0.6 },
      rightShoe: { x: 65, y: 85, scale: 0.6 },
    },
  },
];

const INITIAL_SHOP_ITEMS: ShopItem[] = [
  // Питомцы
  { id: 'pet-cat', name: 'Котик', emoji: '🐱', category: 'pets', price: 100, owned: true },
  { id: 'pet-dog', name: 'Собачка', emoji: '🐶', category: 'pets', price: 150, owned: false },
  { id: 'pet-dragon', name: 'Дракон', emoji: '🐉', category: 'pets', price: 300, owned: false },
  
  // Шляпы
  { id: 'hat-wizard', name: 'Волшебная шляпа', emoji: '🎩', category: 'hats', price: 50, owned: false },
  { id: 'hat-party', name: 'Праздничная шляпа', emoji: '🎉', category: 'hats', price: 75, owned: false },
  
  // Ботинки
  { id: 'shoes-sneakers', name: 'Кроссовки', emoji: '👟', category: 'shoes', price: 60, owned: false },
  { id: 'shoes-boots', name: 'Сапоги', emoji: '👢', category: 'shoes', price: 80, owned: false },
];

const INITIAL_FOOD: FoodItem[] = [
  { id: 'food-apple', name: 'Яблоко', emoji: '🍎', currencyReward: 2, restoreAmount: 20 },
  { id: 'food-pizza', name: 'Пицца', emoji: '🍕', currencyReward: 5, restoreAmount: 20 },
  { id: 'food-cake', name: 'Торт', emoji: '🍰', currencyReward: 8, restoreAmount: 20 },
  { id: 'food-meat', name: 'Мясо', emoji: '🥩', currencyReward: 10, restoreAmount: 20 },
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  { id: 'activity-game', name: 'Игра', emoji: '🎮', currencyReward: 3, restoreAmount: 15 },
  { id: 'activity-dart', name: 'Дартс', emoji: '🎯', currencyReward: 5, restoreAmount: 15 },
  { id: 'activity-dice', name: 'Кости', emoji: '🎲', currencyReward: 4, restoreAmount: 15 },
  { id: 'activity-art', name: 'Рисование', emoji: '🎨', currencyReward: 6, restoreAmount: 15 },
];

export class TamagotchiService {
  private state: TamagotchiState;
  private decreaseInterval: number | null = null;
  private lastDecreaseTime: number = Date.now();

  constructor() {
    // Инициализация с начальными данными
    this.state = {
      currentPet: INITIAL_PETS[0],
      currency: 150,
      ownedPets: ['pet-cat'],
      ownedItems: [],
      shopItems: INITIAL_SHOP_ITEMS,
    };
    
    // Загрузка из localStorage (если есть)
    this.loadFromStorage();
    
    // Применяем уменьшение за прошедшее время
    this.applyTimeBasedDecrease();
    
    // Запускаем таймер для уменьшения шкал (1 единица в минуту = 60000 мс)
    this.startDecreaseTimer();
  }

  // Применяем уменьшение за прошедшее время
  private applyTimeBasedDecrease(): void {
    const now = Date.now();
    const timePassed = now - this.lastDecreaseTime;
    const minutesPassed = timePassed / 60000; // миллисекунды в минуты
    
    if (minutesPassed >= 1) {
      const decreaseAmount = Math.floor(minutesPassed);
      this.state.currentPet.fullness = Math.max(0, this.state.currentPet.fullness - decreaseAmount);
      this.state.currentPet.happiness = Math.max(0, this.state.currentPet.happiness - decreaseAmount);
      this.lastDecreaseTime = now - (timePassed % 60000); // Сохраняем остаток
      this.saveToStorage();
    }
  }

  // Запуск таймера для уменьшения шкал
  private startDecreaseTimer(): void {
    // Уменьшаем каждую минуту (60000 мс)
    this.decreaseInterval = window.setInterval(() => {
      this.state.currentPet.fullness = Math.max(0, this.state.currentPet.fullness - 1);
      this.state.currentPet.happiness = Math.max(0, this.state.currentPet.happiness - 1);
      this.lastDecreaseTime = Date.now();
      this.saveToStorage();
    }, 60000);
  }

  // Остановка таймера (если нужно)
  public stopDecreaseTimer(): void {
    if (this.decreaseInterval !== null) {
      clearInterval(this.decreaseInterval);
      this.decreaseInterval = null;
    }
  }

  // Получить текущего питомца
  getPet(): Pet {
    // Применяем уменьшение за прошедшее время перед получением данных
    this.applyTimeBasedDecrease();
    return this.state.currentPet;
  }

  // Получить валюту
  getCurrency(): number {
    return this.state.currency;
  }

  // Получить состояние
  getState(): TamagotchiState {
    return this.state;
  }

  // Покормить питомца
  feedPet(foodId: string): Promise<{ success: boolean; currency: number }> {
    const food = INITIAL_FOOD.find(f => f.id === foodId);
    if (!food) {
      return Promise.resolve({ success: false, currency: 0 });
    }

    // Применяем уменьшение за прошедшее время перед кормлением
    this.applyTimeBasedDecrease();

    const fullnessBefore = this.state.currentPet.fullness;
    const maxRestore = food.restoreAmount; // Максимальное восстановление
    const fullnessAfter = Math.min(100, fullnessBefore + maxRestore);
    const actualRestore = fullnessAfter - fullnessBefore; // Сколько реально восстановлено

    // Обновляем состояние
    this.state.currentPet.fullness = fullnessAfter;
    
    // Рассчитываем награду пропорционально: N * (actual / max)
    const reward = actualRestore > 0 
      ? Math.ceil(food.currencyReward * (actualRestore / maxRestore))
      : 0;
    
    this.state.currency += reward;

    this.saveToStorage();
    return Promise.resolve({
      success: true,
      currency: reward,
    });
  }

  // Поиграть с питомцем
  playWithPet(activityId: string): Promise<{ success: boolean; currency: number }> {
    const activity = INITIAL_ACTIVITIES.find(a => a.id === activityId);
    if (!activity) {
      return Promise.resolve({ success: false, currency: 0 });
    }

    // Применяем уменьшение за прошедшее время перед игрой
    this.applyTimeBasedDecrease();

    const happinessBefore = this.state.currentPet.happiness;
    const maxRestore = activity.restoreAmount; // Максимальное восстановление
    const happinessAfter = Math.min(100, happinessBefore + maxRestore);
    const actualRestore = happinessAfter - happinessBefore; // Сколько реально восстановлено

    // Обновляем состояние
    this.state.currentPet.happiness = happinessAfter;
    
    // Рассчитываем награду пропорционально: N * (actual / max)
    const reward = actualRestore > 0
      ? Math.ceil(activity.currencyReward * (actualRestore / maxRestore))
      : 0;
    
    this.state.currency += reward;

    this.saveToStorage();
    return Promise.resolve({
      success: true,
      currency: reward,
    });
  }

  // Купить предмет
  buyItem(itemId: string): Promise<boolean> {
    const item = this.state.shopItems.find(i => i.id === itemId);
    if (!item || item.owned || this.state.currency < item.price) {
      return Promise.resolve(false);
    }

    // Покупаем
    this.state.currency -= item.price;
    item.owned = true;
    this.state.ownedItems.push(itemId);

    // Если это питомец, добавляем в коллекцию
    if (item.category === 'pets') {
      this.state.ownedPets.push(itemId as any);
    }

    this.saveToStorage();
    return Promise.resolve(true);
  }

  // Выбрать предмет (применить на питомце)
  selectItem(itemId: string): void {
    const item = this.state.shopItems.find(i => i.id === itemId);
    if (!item || !item.owned) return;

    if (item.category === 'hats') {
      this.state.currentPet.equippedHat = itemId;
    } else if (item.category === 'shoes') {
      this.state.currentPet.equippedShoes = itemId;
    } else if (item.category === 'pets') {
      // Переключение питомца
      const pet = INITIAL_PETS.find(p => p.id === itemId);
      if (pet) {
        this.state.currentPet = { ...pet };
      }
    }

    this.saveToStorage();
  }

  // Получить предметы магазина по категории
  getShopItems(category: ShopCategory): ShopItem[] {
    return this.state.shopItems.filter(item => item.category === category);
  }

  // Получить еду
  getFoodItems(): FoodItem[] {
    return INITIAL_FOOD;
  }

  // Получить развлечения
  getActivityItems(): ActivityItem[] {
    return INITIAL_ACTIVITIES;
  }


  // Сохранение в localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem('tamagotchi-state', JSON.stringify(this.state));
      localStorage.setItem('tamagotchi-last-decrease', this.lastDecreaseTime.toString());
    } catch (error) {
      console.error('Failed to save tamagotchi state:', error);
    }
  }

  // Загрузка из localStorage
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('tamagotchi-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Мержим данные, сохраняя новые поля из начальных данных (например, imageUrl)
        if (parsed.currentPet) {
          const initialPet = INITIAL_PETS.find(p => p.id === parsed.currentPet.id);
          if (initialPet) {
            // Объединяем сохраненные данные с начальными данными (imageUrl, accessoryConfig)
            this.state.currentPet = {
              ...initialPet,
              ...parsed.currentPet,
              // Сохраняем важные поля из начальных данных
              imageUrl: initialPet.imageUrl || parsed.currentPet.imageUrl,
              accessoryConfig: initialPet.accessoryConfig || parsed.currentPet.accessoryConfig,
            };
          } else {
            this.state.currentPet = parsed.currentPet;
          }
        }
        // Обновляем остальные поля состояния
        this.state.currency = parsed.currency ?? this.state.currency;
        this.state.ownedPets = parsed.ownedPets ?? this.state.ownedPets;
        this.state.ownedItems = parsed.ownedItems ?? this.state.ownedItems;
        // Обновляем shopItems, мержа с начальными данными
        if (parsed.shopItems) {
          this.state.shopItems = this.state.shopItems.map(initialItem => {
            const savedItem = parsed.shopItems.find((s: any) => s.id === initialItem.id);
            return savedItem ? { ...initialItem, ...savedItem } : initialItem;
          });
        }
      }
      
      const lastDecrease = localStorage.getItem('tamagotchi-last-decrease');
      if (lastDecrease) {
        this.lastDecreaseTime = parseInt(lastDecrease, 10);
      }
    } catch (error) {
      console.error('Failed to load tamagotchi state:', error);
    }
  }
}

// Singleton instance
export const tamagotchiService = new TamagotchiService();

