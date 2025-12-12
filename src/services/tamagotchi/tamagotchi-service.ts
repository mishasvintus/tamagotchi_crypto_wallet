import type { 
  Pet, 
  ShopItem, 
  FoodItem, 
  ActivityItem, 
  ShopCategory,
  TamagotchiState,
} from '@/tamagotchi/types';
import { INITIAL_PETS, INITIAL_SHOP_ITEMS, INITIAL_FOOD, INITIAL_ACTIVITIES } from './constants';
import { StorageManager } from './storage/storage-manager';
import { StateManager } from './state/state-manager';
import { DecreaseTimer } from './timers/decrease-timer';
import './admin-commands';

export class TamagotchiService {
  private stateManager: StateManager;
  private storageManager: StorageManager;
  private decreaseTimer: DecreaseTimer;

  constructor() {
    this.storageManager = new StorageManager();
    const savedUserState = this.storageManager.loadUserState();
    
    this.stateManager = new StateManager(savedUserState, this.storageManager);

    const lastDecrease = this.storageManager.loadLastDecreaseTime();
    const lastFullHappiness = this.storageManager.loadLastFullHappinessTime();
    const lastFullFullness = this.storageManager.loadLastFullFullnessTime();

    this.decreaseTimer = new DecreaseTimer(
      lastDecrease,
      lastFullHappiness,
      lastFullFullness,
      (canDecreaseHappiness, canDecreaseFullness) => {
        if (canDecreaseHappiness) {
          const current = this.stateManager.getCurrentPet().happiness;
          this.stateManager.setHappiness(Math.max(0, current - 1));
        }
        if (canDecreaseFullness) {
          const current = this.stateManager.getCurrentPet().fullness;
          this.stateManager.setFullness(Math.max(0, current - 1));
        }
      },
      this.saveTimers.bind(this)
    );

    this.decreaseTimer.applyTimeBasedDecrease();
    this.decreaseTimer.start();
  }

  getPet(): Pet {
    this.decreaseTimer.applyTimeBasedDecrease();
    return this.stateManager.getCurrentPet();
  }

  getCurrency(): number {
    return this.stateManager.getCurrency();
  }

  getState(): TamagotchiState {
    return this.stateManager.getState();
  }

  feedPet(foodId: string): Promise<{ success: boolean; currency: number }> {
    const food = INITIAL_FOOD.find(f => f.id === foodId);
    if (!food) {
      return Promise.resolve({ success: false, currency: 0 });
    }

    this.decreaseTimer.applyTimeBasedDecrease();

    const pet = this.stateManager.getCurrentPet();
    const fullnessBefore = pet.fullness;
    const maxRestore = food.restoreAmount;
    const fullnessAfter = Math.min(100, fullnessBefore + maxRestore);
    const actualRestore = fullnessAfter - fullnessBefore;

    this.stateManager.setFullness(fullnessAfter);
    
    if (fullnessAfter >= 100) {
      this.decreaseTimer.setLastFullFullnessTime(Date.now());
    }
    
    const reward = actualRestore > 0 
      ? Math.ceil(food.currencyReward * (actualRestore / maxRestore))
      : 0;
    
    this.stateManager.addCurrency(reward);
    this.saveTimers();

    return Promise.resolve({
      success: true,
      currency: reward,
    });
  }

  playWithPet(activityId: string): Promise<{ success: boolean; currency: number }> {
    const activity = INITIAL_ACTIVITIES.find(a => a.id === activityId);
    if (!activity) {
      return Promise.resolve({ success: false, currency: 0 });
    }

    this.decreaseTimer.applyTimeBasedDecrease();

    const pet = this.stateManager.getCurrentPet();
    const happinessBefore = pet.happiness;
    const maxRestore = activity.restoreAmount;
    const happinessAfter = Math.min(100, happinessBefore + maxRestore);
    const actualRestore = happinessAfter - happinessBefore;

    this.stateManager.setHappiness(happinessAfter);
    
    if (happinessAfter >= 100) {
      this.decreaseTimer.setLastFullHappinessTime(Date.now());
    }
    
    const reward = actualRestore > 0
      ? Math.ceil(activity.currencyReward * (actualRestore / maxRestore))
      : 0;
    
    this.stateManager.addCurrency(reward);
    this.saveTimers();

    return Promise.resolve({
      success: true,
      currency: reward,
    });
  }

  buyItem(itemId: string): Promise<boolean> {
    const item = INITIAL_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || this.stateManager.isItemOwned(itemId) || this.stateManager.getCurrency() < item.price) {
      return Promise.resolve(false);
    }

    this.stateManager.subtractCurrency(item.price);
    this.stateManager.addOwnedItem(itemId);

    if (item.category === 'pets') {
      this.stateManager.addOwnedPet(itemId);
    }

    return Promise.resolve(true);
  }

  selectItem(itemId: string): void {
    const item = INITIAL_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || !this.stateManager.isItemOwned(itemId)) return;

    if (item.category === 'hats') {
      const hatId = itemId === 'hat-none' ? undefined : itemId;
      this.stateManager.setEquippedHat(hatId);
    } else if (item.category === 'shoes') {
      const shoesId = itemId === 'shoes-none' ? undefined : itemId;
      this.stateManager.setEquippedShoes(shoesId);
    } else if (item.category === 'pets') {
      this.stateManager.setCurrentPetId(itemId);
    }
  }

  getShopItems(category: ShopCategory): ShopItem[] {
    return this.stateManager.getShopItemsByCategory(category);
  }

  getFoodItems(): FoodItem[] {
    return INITIAL_FOOD;
  }

  getActivityItems(): ActivityItem[] {
    return INITIAL_ACTIVITIES;
  }

  getInitialPet(petId: string): Pet | undefined {
    return INITIAL_PETS.find(p => p.id === petId);
  }

  rewardForWalletAction(action: 'created' | 'transaction-sent' | 'transaction-received'): void {
    let currencyReward = 0;
    let happinessReward = 0;

    switch (action) {
      case 'created':
        currencyReward = 50;
        happinessReward = 20;
        break;
      case 'transaction-sent':
        currencyReward = 10;
        happinessReward = 10;
        break;
      case 'transaction-received':
        currencyReward = 15;
        happinessReward = 15;
        break;
    }

    this.stateManager.addCurrency(currencyReward);
    const currentHappiness = this.stateManager.getCurrentPet().happiness;
    this.stateManager.setHappiness(Math.min(100, currentHappiness + happinessReward));
  }

  stopDecreaseTimer(): void {
    this.decreaseTimer.stop();
  }

  private saveTimers(): void {
    this.storageManager.saveLastDecreaseTime(this.decreaseTimer.getLastDecreaseTime());
    if (this.decreaseTimer.getLastFullHappinessTime() !== null) {
      this.storageManager.saveLastFullHappinessTime(this.decreaseTimer.getLastFullHappinessTime()!);
    }
    if (this.decreaseTimer.getLastFullFullnessTime() !== null) {
      this.storageManager.saveLastFullFullnessTime(this.decreaseTimer.getLastFullFullnessTime()!);
    }
  }
}

let tamagotchiServiceInstance: TamagotchiService | null = null;

function createTamagotchiService(): TamagotchiService {
  if (tamagotchiServiceInstance) {
    tamagotchiServiceInstance.stopDecreaseTimer();
  }
  tamagotchiServiceInstance = new TamagotchiService();
  return tamagotchiServiceInstance;
}

export const tamagotchiService = createTamagotchiService();

if (typeof window !== 'undefined') {
  (window as any).tamagotchiService = tamagotchiService;
}

