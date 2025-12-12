import type { 
  Pet, 
  ShopItem, 
  FoodItem, 
  ActivityItem, 
  ShopCategory,
  TamagotchiState,
  PetAccessoryConfig,
} from '@/tamagotchi/types';

const DEFAULT_ACCESSORY_CONFIG: PetAccessoryConfig = {
  hat: { x: 50, y: 8, scale: 0.75 },
  leftShoe: { x: 35, y: 88, scale: 0.55 },
  rightShoe: { x: 65, y: 88, scale: 0.55 },
};

// Начальные данные игры
const INITIAL_PETS: Pet[] = [
  {
    id: 'pet-cat',
    name: 'Cat',
    emoji: '🐱',
    imageUrl: '/assets/pets/cat.png',
    happiness: 75,
    fullness: 70,
    accessoryConfig: { ...DEFAULT_ACCESSORY_CONFIG },
    scale: 1.0,
    verticalOffset: 0,
  },
  {
    id: 'pet-dog',
    name: 'Dog',
    emoji: '🐶',
    imageUrl: '/assets/pets/dog.png',
    happiness: 85,
    fullness: 60,
    accessoryConfig: { ...DEFAULT_ACCESSORY_CONFIG },
    scale: 1.1,
    verticalOffset: 0.5,
  },
  {
    id: 'pet-fox',
    name: 'Fox',
    emoji: '🦊',
    imageUrl: '/assets/pets/fox.png',
    happiness: 70,
    fullness: 65,
    accessoryConfig: { ...DEFAULT_ACCESSORY_CONFIG },
    scale: 1.14,
    verticalOffset: -0.6,
  },
  {
    id: 'pet-cow',
    name: 'Cow',
    emoji: '🐮',
    imageUrl: '/assets/pets/cow.png',
    happiness: 65,
    fullness: 80,
    accessoryConfig: { ...DEFAULT_ACCESSORY_CONFIG },
    scale: 1.3,
    verticalOffset: -3,
  },
  {
    id: 'pet-dragon',
    name: 'Dragon',
    emoji: '🐉',
    imageUrl: '/assets/pets/dragon.png',
    happiness: 90,
    fullness: 90,
    accessoryConfig: { ...DEFAULT_ACCESSORY_CONFIG },
    scale: 1.08,
    verticalOffset: 0.4,
  },
  {
    id: 'pet-vampire',
    name: 'Vampire',
    emoji: '🧛',
    imageUrl: '/assets/pets/vampire.png',
    happiness: 60,
    fullness: 60,
    accessoryConfig: { ...DEFAULT_ACCESSORY_CONFIG },
    scale: 1.14,
    verticalOffset: 0.4,
  },
];

const INITIAL_SHOP_ITEMS: ShopItem[] = [
  // Питомцы
  { id: 'pet-cat', name: 'Cat', emoji: '🐱', imageUrl: '/assets/pets/cat.png', category: 'pets', price: 0, owned: true },
  { id: 'pet-dog', name: 'Dog', emoji: '🐶', imageUrl: '/assets/pets/dog.png', category: 'pets', price: 150, owned: false },
  { id: 'pet-fox', name: 'Fox', emoji: '🦊', imageUrl: '/assets/pets/fox.png', category: 'pets', price: 180, owned: false },
  { id: 'pet-cow', name: 'Cow', emoji: '🐮', imageUrl: '/assets/pets/cow.png', category: 'pets', price: 200, owned: false },
  { id: 'pet-dragon', name: 'Dragon', emoji: '🐉', imageUrl: '/assets/pets/dragon.png', category: 'pets', price: 300, owned: false },
  { id: 'pet-vampire', name: 'Vampire', emoji: '🧛', imageUrl: '/assets/pets/vampire.png', category: 'pets', price: 350, owned: false },
  
  // Шляпы (с индивидуальными настройками позиционирования)
  { id: 'hat-none', name: 'Без шляпы', emoji: '', category: 'hats', price: 0, owned: true },
  { 
    id: 'hat-cap', 
    name: 'Кепка', 
    emoji: '🧢', 
    imageUrl: '/assets/hats/hat_cap.png', 
    category: 'hats', 
    price: 50, 
    owned: false,
    accessoryConfig: { x: 45, y: 15, scale: 0.25 } 
  },
  { 
    id: 'hat-kotelok', 
    name: 'Котелок', 
    emoji: '🎩', 
    imageUrl: '/assets/hats/hat_kotelok.png', 
    category: 'hats', 
    price: 75, 
    owned: false,
    accessoryConfig: { x: 49, y: 10, scale: 0.18 } // Индивидуальная конфигурация для котелка
  },
  
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
  private lastFullHappinessTime: number | null = null; // Время последнего полного заполнения счастья
  private lastFullFullnessTime: number | null = null; // Время последнего полного заполнения сытости

  constructor() {
    // Инициализация с начальными данными
    const defaultPet = INITIAL_PETS.find(p => p.id === 'pet-cat') || INITIAL_PETS[0];
    this.state = {
      currentPet: defaultPet,
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
    const tenMinutesInMs = 10 * 60 * 1000; // 10 минут в миллисекундах
    
    if (minutesPassed >= 1) {
      const decreaseAmount = Math.floor(minutesPassed);
      
      // Проверяем, можно ли уменьшать счастье
      let canDecreaseHappiness = true;
      if (this.lastFullHappinessTime !== null) {
        const timeSinceFull = now - this.lastFullHappinessTime;
        if (timeSinceFull < tenMinutesInMs) {
          canDecreaseHappiness = false;
        }
      }
      
      // Проверяем, можно ли уменьшать сытость
      let canDecreaseFullness = true;
      if (this.lastFullFullnessTime !== null) {
        const timeSinceFull = now - this.lastFullFullnessTime;
        if (timeSinceFull < tenMinutesInMs) {
          canDecreaseFullness = false;
        }
      }
      
      if (canDecreaseHappiness) {
        this.state.currentPet.happiness = Math.max(0, this.state.currentPet.happiness - decreaseAmount);
      }
      
      if (canDecreaseFullness) {
        this.state.currentPet.fullness = Math.max(0, this.state.currentPet.fullness - decreaseAmount);
      }
      
      this.lastDecreaseTime = now - (timePassed % 60000); // Сохраняем остаток
      this.saveToStorage();
    }
  }

  // Запуск таймера для уменьшения шкал
  private startDecreaseTimer(): void {
    // Уменьшаем каждую минуту (60000 мс)
    this.decreaseInterval = window.setInterval(() => {
      const now = Date.now();
      const tenMinutesInMs = 10 * 60 * 1000; // 10 минут в миллисекундах
      
      // Проверяем, можно ли уменьшать счастье
      let canDecreaseHappiness = true;
      if (this.lastFullHappinessTime !== null) {
        const timeSinceFull = now - this.lastFullHappinessTime;
        if (timeSinceFull < tenMinutesInMs) {
          canDecreaseHappiness = false;
        }
      }
      
      // Проверяем, можно ли уменьшать сытость
      let canDecreaseFullness = true;
      if (this.lastFullFullnessTime !== null) {
        const timeSinceFull = now - this.lastFullFullnessTime;
        if (timeSinceFull < tenMinutesInMs) {
          canDecreaseFullness = false;
        }
      }
      
      if (canDecreaseHappiness) {
        this.state.currentPet.happiness = Math.max(0, this.state.currentPet.happiness - 1);
      }
      
      if (canDecreaseFullness) {
        this.state.currentPet.fullness = Math.max(0, this.state.currentPet.fullness - 1);
      }
      
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
    
    // Если шкала полностью заполнена, сохраняем время
    if (fullnessAfter >= 100) {
      this.lastFullFullnessTime = Date.now();
    }
    
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
    
    // Если шкала полностью заполнена, сохраняем время
    if (happinessAfter >= 100) {
      this.lastFullHappinessTime = Date.now();
    }
    
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

  // Получить начальные данные питомца по id
  getInitialPet(petId: string): Pet | undefined {
    return INITIAL_PETS.find(p => p.id === petId);
  }

  // Награда за действие в кошельке
  rewardForWalletAction(action: 'created' | 'transaction-sent' | 'transaction-received'): void {
    let currencyReward = 0;
    let happinessReward = 0;

    switch (action) {
      case 'created':
        currencyReward = 50; // Награда за создание кошелька
        happinessReward = 20;
        break;
      case 'transaction-sent':
        currencyReward = 10; // Награда за отправку транзакции
        happinessReward = 10;
        break;
      case 'transaction-received':
        currencyReward = 15; // Награда за получение транзакции
        happinessReward = 15;
        break;
    }

    // Увеличиваем валюту
    this.state.currency += currencyReward;

    // Увеличиваем счастье (с ограничением до 100)
    this.state.currentPet.happiness = Math.min(100, this.state.currentPet.happiness + happinessReward);

    // Сохраняем изменения
    this.saveToStorage();
  }


  // Сохранение в localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem('tamagotchi-state', JSON.stringify(this.state));
      localStorage.setItem('tamagotchi-last-decrease', this.lastDecreaseTime.toString());
      if (this.lastFullHappinessTime !== null) {
        localStorage.setItem('tamagotchi-last-full-happiness', this.lastFullHappinessTime.toString());
      }
      if (this.lastFullFullnessTime !== null) {
        localStorage.setItem('tamagotchi-last-full-fullness', this.lastFullFullnessTime.toString());
      }
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
            // Объединяем сохраненные данные с начальными данными
            // Важно: начальные данные (imageUrl, accessoryConfig, scale, verticalOffset) имеют приоритет
            // так как они определяют внешний вид питомца, а сохраненные данные - только состояние (happiness, fullness, equippedHat, etc.)
            this.state.currentPet = {
              ...initialPet, // Начальные данные (включая imageUrl, accessoryConfig, scale, verticalOffset)
              ...parsed.currentPet, // Сохраненные данные (happiness, fullness, equippedHat, equippedShoes)
              // Явно сохраняем важные поля из начальных данных (они не должны перезаписываться)
              imageUrl: initialPet.imageUrl,
              accessoryConfig: initialPet.accessoryConfig,
              scale: initialPet.scale ?? parsed.currentPet.scale ?? 1.0,
              verticalOffset: initialPet.verticalOffset ?? parsed.currentPet.verticalOffset ?? 0,
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
            if (savedItem) {
              // Важно: accessoryConfig, imageUrl и другие визуальные настройки всегда берутся из initialItem
              // так как они определяются кодом, а не пользовательскими данными
              return { 
                ...initialItem, // Начальные данные (включая accessoryConfig, imageUrl)
                ...savedItem, // Сохраненные данные (owned, price может меняться)
                // Явно сохраняем визуальные поля из начальных данных
                accessoryConfig: initialItem.accessoryConfig ?? savedItem.accessoryConfig,
                imageUrl: initialItem.imageUrl ?? savedItem.imageUrl,
                emoji: initialItem.emoji ?? savedItem.emoji,
                name: initialItem.name ?? savedItem.name,
              };
            }
            return initialItem;
          });
        }
      }
      
      const lastDecrease = localStorage.getItem('tamagotchi-last-decrease');
      if (lastDecrease) {
        this.lastDecreaseTime = parseInt(lastDecrease, 10);
      }
      
      const lastFullHappiness = localStorage.getItem('tamagotchi-last-full-happiness');
      if (lastFullHappiness) {
        this.lastFullHappinessTime = parseInt(lastFullHappiness, 10);
      }
      
      const lastFullFullness = localStorage.getItem('tamagotchi-last-full-fullness');
      if (lastFullFullness) {
        this.lastFullFullnessTime = parseInt(lastFullFullness, 10);
      }
    } catch (error) {
      console.error('Failed to load tamagotchi state:', error);
    }
  }
}

// Singleton instance
export const tamagotchiService = new TamagotchiService();

