# Модуль Тамагочи (Tamagotchi Module)

Модуль виртуального питомца для криптокошелька. Поддерживает управление питомцем (кормление, развлечения), покупку и кастомизацию аксессуаров (шляпы, ботинки), а также интеграцию с событиями кошелька для награждения питомца.

## Содержание

- [Архитектура](#архитектура)
- [Слои приложения](#слои-приложения)
- [Core Layer](#core-layer)
- [Service Layer](#service-layer)
- [UI Layer](#ui-layer)
- [Зависимости](#зависимости)
- [Хранение данных](#хранение-данных)
- [Event Bus Integration](#event-bus-integration)
- [Типы данных](#типы-данных)
- [Admin Commands](#admin-commands)

---

## Архитектура

Модуль построен по принципу трёхслойной архитектуры:

```
┌───────────────────────────────────────────────────────────────┐
│                      UI Layer                                 │
│  ┌────────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │TamagotchiModule│ │    Pages     │ │     Components       │ │
│  └────────────────┘ └──────────────┘ └──────────────────────┘ │
│                          │                                    │
│                   ┌──────┴──────┐                             │
│                   │ tamagotchi  │  (Direct Service Access)    │
│                   │   Service   │                             │
│                   └─────────────┘                             │
└─────────────────────────┬─────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                    Service Layer                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 TamagotchiService                       ││
│  │  • getPet()              • buyItem()                    ││
│  │  • feedPet()             • selectItem()                 ││
│  │  • playWithPet()         • rewardForWalletAction()      ││
│  │  • getCurrency()         • getShopItems()               ││
│  └─────────────────────────────────────────────────────────┘│
│                          │                                  │
│  ┌──────────────────────┐│                                  │
│  │      EventBus        ││ (События от кошелька)            │
│  └──────────────────────┘│                                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                     Core Layer                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ StateManager │ │StorageManager│ │   DecreaseTimer      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│         │                │                   │              │
│  ┌──────┴──────┐  ┌──────┴──────┐   ┌────────┴────────┐     │
│  │  UserState  │  │ localStorage│   │  Timer Logic    │     │
│  └─────────────┘  └─────────────┘   └─────────────────┘     │
│         │                                                   │
│  ┌──────┴────────────────────────────────────────────────┐  │
│  │         Constants (Pets, Items, Food, Activities)     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Слои приложения

### Структура файлов

```
src/
├── services/tamagotchi/
│   ├── constants/
│   │   ├── index.ts              # Экспорт всех констант
│   │   ├── pets.ts               # Начальные данные питомцев
│   │   ├── shop-items.ts         # Предметы магазина (шляпы, ботинки, питомцы)
│   │   ├── food.ts               # Еда для кормления
│   │   └── activities.ts         # Развлечения для питомца
│   ├── state/
│   │   └── state-manager.ts      # Управление состоянием приложения
│   ├── storage/
│   │   ├── user-state.ts         # Интерфейс UserState
│   │   └── storage-manager.ts   # Работа с localStorage
│   ├── timers/
│   │   └── decrease-timer.ts    # Таймер уменьшения статов
│   ├── tamagotchi-service.ts    # Главный сервис (singleton)
│   └── admin-commands.ts         # Админские команды для отладки
├── tamagotchi/
│   └── types.ts                  # TypeScript типы
└── ui/modules/tamagotchi/
    ├── components/               # UI компоненты
    │   ├── PetDisplay.tsx       # Отображение питомца с аксессуарами
    │   ├── MoneyAnimation.tsx   # Анимация летающих банкнот
    │   ├── CurrencyButton.tsx   # Кнопка валюты
    │   ├── StatsRow.tsx          # Строка статистики
    │   ├── ShopItemCard.tsx      # Карточка предмета в магазине
    │   └── ...
    ├── pages/                    # Страницы модуля
    │   ├── HomePage.tsx          # Главная страница
    │   ├── ShopPage.tsx          # Магазин
    │   └── StatPage.tsx          # Страница кормления/развлечений
    ├── TamagotchiModule.tsx     # Главный компонент модуля
    └── TamagotchiModule.css
```

---

## Core Layer

Core Layer содержит низкоуровневую логику работы с состоянием, хранилищем и таймерами.

### UserState (`storage/user-state.ts`)

Интерфейс, описывающий все пользовательские данные, которые сохраняются в `localStorage`.

```typescript
export interface UserState {
  currency: number;              // Игровая валюта
  ownedPets: string[];           // ID купленных питомцев
  ownedItems: string[];           // ID купленных предметов
  currentPetId: string;           // ID текущего выбранного питомца
  equippedHat: string | undefined;    // ID надетой шляпы
  equippedShoes: string | undefined; // ID надетых ботинок
  happiness: number;             // Счастье (0-100)
  fullness: number;              // Сытость (0-100)
}
```

### StorageManager (`storage/storage-manager.ts`)

Управление сохранением и загрузкой данных из `localStorage`.

```typescript
class StorageManager {
  // Сохранение/загрузка всего состояния
  saveUserState(state: UserState): void;
  loadUserState(): UserState | null;

  // Обновление отдельных полей
  updateCurrency(value: number, currentState: UserState): void;
  updateCurrentPetId(value: string, currentState: UserState): void;
  updateEquippedHat(value: string | undefined, currentState: UserState): void;
  updateEquippedShoes(value: string | undefined, currentState: UserState): void;
  updateHappiness(value: number, currentState: UserState): void;
  updateFullness(value: number, currentState: UserState): void;
  addOwnedItem(itemId: string, currentState: UserState): void;
  addOwnedPet(petId: string, currentState: UserState): void;

  // Работа с таймерами
  saveLastDecreaseTime(timestamp: number): void;
  loadLastDecreaseTime(): number | null;
  saveLastFullHappinessTime(timestamp: number): void;
  loadLastFullHappinessTime(): number | null;
  saveLastFullFullnessTime(timestamp: number): void;
  loadLastFullFullnessTime(): number | null;
}
```

**Ключи localStorage:**
- `tamagotchi-user-state` — полное состояние пользователя
- `tamagotchi-last-decrease` — время последнего уменьшения статов
- `tamagotchi-last-full-happiness` — время последнего полного счастья
- `tamagotchi-last-full-fullness` — время последней полной сытости

**Особенности:**
- Каждое изменение состояния немедленно сохраняется в `localStorage`
- Все методы обновления принимают `currentState` для атомарного обновления
- Обработка ошибок при сохранении/загрузке

### StateManager (`state/state-manager.ts`)

Управление состоянием приложения на основе `UserState` и констант.

```typescript
class StateManager {
  // Получение состояния
  getState(): TamagotchiState;
  getCurrentPet(): Pet;
  getCurrency(): number;
  getUserState(): UserState;
  getOwnedItems(): string[];
  getOwnedPets(): string[];
  getShopItems(): ShopItem[];
  getShopItemsByCategory(category: string): ShopItem[];

  // Управление валютой
  setCurrency(amount: number): void;
  addCurrency(amount: number): void;
  subtractCurrency(amount: number): void;

  // Управление питомцем
  setCurrentPetId(petId: string): void;
  setHappiness(value: number): void;
  setFullness(value: number): void;

  // Управление аксессуарами
  setEquippedHat(hatId: string | undefined): void;
  setEquippedShoes(shoesId: string | undefined): void;

  // Управление инвентарём
  addOwnedItem(itemId: string): void;
  addOwnedPet(petId: string): void;
  isItemOwned(itemId: string): boolean;
}
```

**Особенности:**
- `buildCurrentPet()` — собирает объект `Pet` из `UserState` и констант `INITIAL_PETS`
- `updateShopItemsOwned()` — обновляет флаг `owned` у предметов магазина
- Все изменения состояния автоматически сохраняются через `StorageManager`
- Проверка владения предметом учитывает `item.owned` из констант и `userState.ownedItems`

### DecreaseTimer (`timers/decrease-timer.ts`)

Таймер для автоматического уменьшения статов питомца со временем.

```typescript
class DecreaseTimer {
  constructor(
    initialLastDecrease: number | null,
    initialLastFullHappiness: number | null,
    initialLastFullFullness: number | null,
    onDecrease: (canDecreaseHappiness: boolean, canDecreaseFullness: boolean) => void,
    onSave: () => void
  );

  // Управление таймером
  start(): void;
  stop(): void;
  applyTimeBasedDecrease(): void;

  // Получение/установка времени
  getLastDecreaseTime(): number;
  getLastFullHappinessTime(): number | null;
  getLastFullFullnessTime(): number | null;
  setLastFullHappinessTime(timestamp: number): void;
  setLastFullFullnessTime(timestamp: number): void;
}
```

**Логика работы:**
- Уменьшение статов происходит каждую минуту
- После достижения 100% стата действует 10-минутная защита от уменьшения
- `applyTimeBasedDecrease()` применяет уменьшения за прошедшее время при загрузке
- `start()` запускает интервал на 60 секунд

### Constants

Статические данные, определяющие начальное состояние игры.

#### Pets (`constants/pets.ts`)

```typescript
export const INITIAL_PETS: Pet[] = [
  {
    id: 'pet-cat',
    name: 'Cat',
    emoji: '🐱',
    imageUrl: '/assets/pets/cat.png',
    happiness: 75,
    fullness: 70,
    accessoryConfig: { hat: {...}, shoes: {...} },
    scale: 1.0,
    verticalOffset: 0,
  },
  // ...
];
```

**Свойства питомца:**
- `accessoryConfig` — конфигурация позиционирования аксессуаров для данного питомца
- `scale` — масштаб тела питомца
- `verticalOffset` — вертикальное смещение спрайта (в процентах)

#### Shop Items (`constants/shop-items.ts`)

```typescript
export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  // Питомцы
  { id: 'pet-cat', name: 'Cat', category: 'pets', price: 0, owned: true, ... },
  // Шляпы
  { id: 'hat-cap', name: 'Кепка', category: 'hats', price: 50, accessoryConfig: {...}, ... },
  // Ботинки
  { id: 'sneakers1', name: 'Кроссовки', category: 'shoes', price: 60, accessoryConfig: {...}, ... },
];
```

**Категории:**
- `pets` — питомцы
- `hats` — шляпы
- `shoes` — ботинки

**Специальные предметы:**
- `hat-none` — опция "без шляпы" (owned: true, price: 0)
- `shoes-none` — опция "без ботинок" (owned: true, price: 0)

#### Food (`constants/food.ts`)

```typescript
export const INITIAL_FOOD: FoodItem[] = [
  { id: 'food-apple', name: 'Яблоко', emoji: '🍎', currencyReward: 2, restoreAmount: 20 },
  // ...
];
```

**Свойства:**
- `currencyReward` — награда в валюте за использование
- `restoreAmount` — количество восстанавливаемых единиц сытости (из 100)

#### Activities (`constants/activities.ts`)

```typescript
export const INITIAL_ACTIVITIES: ActivityItem[] = [
  { id: 'activity-game', name: 'Игра', emoji: '🎮', currencyReward: 3, restoreAmount: 15 },
  // ...
];
```

**Свойства:**
- `currencyReward` — награда в валюте за использование
- `restoreAmount` — количество восстанавливаемых единиц счастья (из 100)

---

## Service Layer

### TamagotchiService (`tamagotchi-service.ts`)

Главный сервис для работы с тамагочи. Связывает Core Layer с UI через единый интерфейс.

```typescript
class TamagotchiService {
  // Получение состояния
  getPet(): Pet;
  getCurrency(): number;
  getState(): TamagotchiState;
  getShopItems(category: ShopCategory): ShopItem[];
  getFoodItems(): FoodItem[];
  getActivityItems(): ActivityItem[];
  getInitialPet(petId: string): Pet | undefined;

  // Действия с питомцем
  feedPet(foodId: string): Promise<{ success: boolean; currency: number }>;
  playWithPet(activityId: string): Promise<{ success: boolean; currency: number }>;

  // Магазин
  buyItem(itemId: string): Promise<boolean>;
  selectItem(itemId: string): void;

  // Интеграция с кошельком
  rewardForWalletAction(action: 'created' | 'transaction-sent' | 'transaction-received'): void;

  // Управление таймером
  stopDecreaseTimer(): void;
}
```

**Singleton Pattern:**
```typescript
let tamagotchiServiceInstance: TamagotchiService | null = null;

function createTamagotchiService(): TamagotchiService {
  if (tamagotchiServiceInstance) {
    tamagotchiServiceInstance.stopDecreaseTimer();
  }
  tamagotchiServiceInstance = new TamagotchiService();
  return tamagotchiServiceInstance;
}

export const tamagotchiService = createTamagotchiService();
```

**Особенности:**
- Singleton гарантирует единственный экземпляр сервиса
- При HMR (Hot Module Replacement) старый таймер останавливается
- Все изменения состояния автоматически сохраняются
- Награды за действия кошелька: создание (50💰 + 20 счастья), отправка (10💰 + 10 счастья), получение (15💰 + 15 счастья)

**Логика кормления/развлечений:**
1. Применяется уменьшение статов за прошедшее время
2. Вычисляется фактическое восстановление (с учётом максимума 100)
3. Награда в валюте пропорциональна фактическому восстановлению
4. Если стат достиг 100%, устанавливается время последнего полного стата (для 10-минутной защиты)

---

## UI Layer

### TamagotchiModule (`ui/modules/tamagotchi/TamagotchiModule.tsx`)

Главный компонент модуля. Управляет навигацией между страницами и интеграцией с событиями кошелька.

**Логика навигации:**
```
┌─────────────────────────────────────────────────────────┐
│                 TamagotchiModule                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  currentPage = 'home'  ───────►  HomePage               │
│                                                         │
│  currentPage = 'shop'  ───────►  ShopPage               │
│                                                         │
│  currentPage = 'entertainment' ──►  StatPage (type)     │
│                                                         │
│  currentPage = 'food'  ───────►  StatPage (type)        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Интеграция с Event Bus:**
- `wallet:created` → награда 50💰, анимация банкнот
- `wallet:transaction-sent` → награда 10💰, анимация банкнот
- `wallet:transaction-received` → награда 15💰, анимация банкнот (сумма зависит от значения транзакции)
- `wallet:balance-changed` → опциональная реакция

### Страницы

| Страница | Файл | Описание |
|----------|------|----------|
| HomePage | `pages/HomePage.tsx` | Главная страница с питомцем и статистикой |
| ShopPage | `pages/ShopPage.tsx` | Магазин для покупки и выбора питомцев, шляп, ботинок |
| StatPage | `pages/StatPage.tsx` | Страница кормления (`type: 'food'`) или развлечений (`type: 'entertainment'`) |

### Компоненты

| Компонент | Описание |
|-----------|----------|
| `PetDisplay` | Отображение питомца с аксессуарами (шляпа, ботинки) |
| `MoneyAnimation` | Анимация летающих банкнот при событиях кошелька |
| `CurrencyButton` | Кнопка отображения валюты |
| `StatsRow` | Строка статистики (счастье, сытость) |
| `ShopItemCard` | Карточка предмета в магазине |
| `ShopActionButton` | Кнопка покупки/выбора предмета |
| `CategoryRow` | Строка категорий магазина |
| `NavigationArrow` | Стрелки навигации в магазине |
| `BackButton` | Кнопка возврата на главную |
| `ActionRow` | Строка действий (кормление/развлечения) |
| `StatButton` | Кнопка отображения стата |

### PetDisplay

Компонент для отображения питомца с аксессуарами.

**Особенности:**
- Поддержка предпросмотра аксессуаров в магазине (`previewHat`, `previewShoes`)
- Динамическое позиционирование аксессуаров на основе `accessoryConfig`
- Поддержка масштабирования и вертикального смещения тела питомца
- Ботинки отображаются как пара с настраиваемым расстоянием (`gap`)
- Z-index: тело (1), левый ботинок (2), правый ботинок (3), шляпа (4)

**Конфигурация аксессуаров:**
- Шляпа: `x`, `y`, `scale`, `rotation` (опционально)
- Ботинки: `x` (центр пары), `y`, `gap` (расстояние), `scale`, `rotation` (опционально)

---

## Зависимости

### Основные библиотеки

| Библиотека | Версия | Назначение |
|------------|--------|------------|
| `react` | ^18.2.0 | UI фреймворк |
| `typescript` | ^5.x | Типизация |

### Диаграмма зависимостей

```
TamagotchiModule
    │
    ├── Pages/Components
    │       │
    │       └── tamagotchiService (direct access)
    │               │
    │               ├── StateManager
    │               │       ├── UserState
    │               │       ├── INITIAL_PETS
    │               │       └── INITIAL_SHOP_ITEMS
    │               │
    │               ├── StorageManager
    │               │       └── localStorage
    │               │
    │               ├── DecreaseTimer
    │               │       └── setInterval
    │               │
    │               └── Constants
    │                       ├── INITIAL_PETS
    │                       ├── INITIAL_SHOP_ITEMS
    │                       ├── INITIAL_FOOD
    │                       └── INITIAL_ACTIVITIES
    │
    └── EventBus (from wallet module)
            └── wallet events
```

---

## Хранение данных

### Структура UserState в localStorage

```typescript
{
  "currency": 150,
  "ownedPets": ["pet-cat"],
  "ownedItems": ["hat-cap"],
  "currentPetId": "pet-cat",
  "equippedHat": "hat-cap",
  "equippedShoes": undefined,
  "happiness": 75,
  "fullness": 70
}
```

### Разделение данных

- **Константы** (pets, shop-items, food, activities) — статические данные, не сохраняются
- **UserState** — динамические пользовательские данные, сохраняются в `localStorage`
- **Таймеры** — метки времени последних событий, сохраняются отдельно

### Жизненный цикл состояния

```
Инициализация:
  localStorage → loadUserState() → StateManager → buildCurrentPet()

Изменение:
  StateManager.set*() → StorageManager.update*() → localStorage

Кормление/Развлечение:
  feedPet() / playWithPet() → setHappiness() / setFullness() → localStorage

Покупка:
  buyItem() → addOwnedItem() → localStorage

Выбор предмета:
  selectItem() → setEquippedHat() / setEquippedShoes() → localStorage
```

---

## Event Bus Integration

### Подписка на события кошелька

```typescript
// В TamagotchiModule.tsx
useEffect(() => {
  const unsubscribeCreated = eventBus.on('wallet:created', (data) => {
    tamagotchiService.rewardForWalletAction('created');
    setMoneyAnimation({ amount: 50, key: Date.now() });
  });

  const unsubscribeSent = eventBus.on('wallet:transaction-sent', (data) => {
    tamagotchiService.rewardForWalletAction('transaction-sent');
    setMoneyAnimation({ amount: 10, key: Date.now() });
  });

  const unsubscribeReceived = eventBus.on('wallet:transaction-received', (data) => {
    tamagotchiService.rewardForWalletAction('transaction-received');
    const amount = parseFloat(data.value);
    const displayAmount = Math.ceil(amount * 100) || 15;
    setMoneyAnimation({ amount: displayAmount, key: Date.now() });
  });

  return () => {
    unsubscribeCreated();
    unsubscribeSent();
    unsubscribeReceived();
  };
}, []);
```

### Награды за действия кошелька

| Событие | Валюта | Счастье |
|---------|--------|---------|
| `wallet:created` | +50 💰 | +20 |
| `wallet:transaction-sent` | +10 💰 | +10 |
| `wallet:transaction-received` | +15 💰 | +15 |

---

## Типы данных

### Pet

```typescript
interface Pet {
  id: PetId;
  name: string;
  emoji: string;
  imageUrl?: string;
  happiness: number;              // 0-100
  fullness: number;                // 0-100
  equippedHat?: ItemId;
  equippedShoes?: ItemId;
  accessoryConfig?: PetAccessoryConfig;
  scale?: number;                  // Масштаб тела (1.0 = 100%)
  verticalOffset?: number;          // Вертикальное смещение (в %)
}
```

### ShopItem

```typescript
interface ShopItem {
  id: ItemId;
  name: string;
  emoji: string;
  imageUrl?: string;
  category: ShopCategory;          // 'pets' | 'hats' | 'shoes'
  price: number;
  owned: boolean;
  accessoryConfig?: AccessoryPositionConfig;
}
```

### AccessoryPositionConfig

```typescript
interface AccessoryPositionConfig {
  x: number;                        // Позиция по X (0-100%)
  y: number;                        // Позиция по Y (0-100%)
  scale: number;                    // Масштаб (1.0 = 100%)
  rotation?: number;                 // Поворот в градусах
  gap?: number;                     // Расстояние между ботинками (только для shoes)
}
```

### FoodItem / ActivityItem

```typescript
interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  currencyReward: number;
  restoreAmount: number;            // Количество восстанавливаемых единиц
}

interface ActivityItem {
  id: string;
  name: string;
  emoji: string;
  currencyReward: number;
  restoreAmount: number;
}
```

### TamagotchiState

```typescript
interface TamagotchiState {
  currentPet: Pet;
  currency: number;
  ownedPets: PetId[];
  ownedItems: ItemId[];
  shopItems: ShopItem[];
}
```

---

## Admin Commands

Админские команды для отладки и тестирования доступны через `window.admin` в консоли браузера.

### Деньги

```javascript
admin.addMoney(1000)        // Добавить деньги
admin.setMoney(500)        // Установить баланс
```

### Время

```javascript
admin.fastForwardTime(30)   // Прокрутить время на 30 минут
```

### Инвентарь

```javascript
admin.resetInventory()      // Обнулить инвентарь (оставить только кошку)
admin.giveItem('hat-cap')   // Добавить предмет в инвентарь
```

### Статы

```javascript
admin.setHappiness(100)     // Установить счастье (0-100)
admin.setFullness(100)      // Установить сытость (0-100)
```

### События кошелька

```javascript
admin.triggerWalletCreated()                    // Инициировать событие создания кошелька
admin.triggerTransactionSent('0.01')            // Инициировать событие отправки транзакции
admin.triggerTransactionReceived('0.1')        // Инициировать событие получения транзакции
admin.triggerBalanceChanged('1.0')              // Инициировать событие изменения баланса
```

### Сброс

```javascript
admin.resetAll()            // Полный сброс всех данных
```

### Справка

```javascript
admin.help()                // Показать справку по всем командам
```

---

## Лицензия

MIT

