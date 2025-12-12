import { UserState } from './user-state';

export class StorageManager {
  private static readonly STATE_KEY = 'tamagotchi-user-state';
  private static readonly LAST_DECREASE_KEY = 'tamagotchi-last-decrease';
  private static readonly LAST_FULL_HAPPINESS_KEY = 'tamagotchi-last-full-happiness';
  private static readonly LAST_FULL_FULLNESS_KEY = 'tamagotchi-last-full-fullness';

  saveUserState(state: UserState): void {
    try {
      localStorage.setItem(StorageManager.STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save user state:', error);
    }
  }

  loadUserState(): UserState | null {
    try {
      const saved = localStorage.getItem(StorageManager.STATE_KEY);
      if (!saved) {
        return null;
      }
      return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to load user state:', error);
      return null;
    }
  }

  updateCurrency(value: number, currentState: UserState): void {
    currentState.currency = value;
    this.saveUserState(currentState);
  }

  updateCurrentPetId(value: string, currentState: UserState): void {
    currentState.currentPetId = value;
    this.saveUserState(currentState);
  }

  updateEquippedHat(value: string | undefined, currentState: UserState): void {
    currentState.equippedHat = value;
    this.saveUserState(currentState);
  }

  updateEquippedShoes(value: string | undefined, currentState: UserState): void {
    currentState.equippedShoes = value;
    this.saveUserState(currentState);
  }

  updateHappiness(value: number, currentState: UserState): void {
    currentState.happiness = Math.max(0, Math.min(100, value));
    this.saveUserState(currentState);
  }

  updateFullness(value: number, currentState: UserState): void {
    currentState.fullness = Math.max(0, Math.min(100, value));
    this.saveUserState(currentState);
  }

  addOwnedItem(itemId: string, currentState: UserState): void {
    if (!currentState.ownedItems.includes(itemId)) {
      currentState.ownedItems.push(itemId);
      this.saveUserState(currentState);
    }
  }

  addOwnedPet(petId: string, currentState: UserState): void {
    if (!currentState.ownedPets.includes(petId)) {
      currentState.ownedPets.push(petId);
      this.saveUserState(currentState);
    }
  }

  saveLastDecreaseTime(timestamp: number): void {
    localStorage.setItem(StorageManager.LAST_DECREASE_KEY, timestamp.toString());
  }

  loadLastDecreaseTime(): number | null {
    const saved = localStorage.getItem(StorageManager.LAST_DECREASE_KEY);
    return saved ? parseInt(saved, 10) : null;
  }

  saveLastFullHappinessTime(timestamp: number): void {
    localStorage.setItem(StorageManager.LAST_FULL_HAPPINESS_KEY, timestamp.toString());
  }

  loadLastFullHappinessTime(): number | null {
    const saved = localStorage.getItem(StorageManager.LAST_FULL_HAPPINESS_KEY);
    return saved ? parseInt(saved, 10) : null;
  }

  saveLastFullFullnessTime(timestamp: number): void {
    localStorage.setItem(StorageManager.LAST_FULL_FULLNESS_KEY, timestamp.toString());
  }

  loadLastFullFullnessTime(): number | null {
    const saved = localStorage.getItem(StorageManager.LAST_FULL_FULLNESS_KEY);
    return saved ? parseInt(saved, 10) : null;
  }
}
