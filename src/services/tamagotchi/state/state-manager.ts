import type { Pet, ShopItem, TamagotchiState } from '@/tamagotchi/types';
import { INITIAL_SHOP_ITEMS } from '../constants';
import { INITIAL_PETS } from '../constants';
import type { UserState } from '../storage/user-state';
import { StorageManager } from '../storage/storage-manager';

export class StateManager {
  private state: TamagotchiState;
  private userState: UserState;
  private storageManager: StorageManager;

  constructor(userState: UserState | null, storageManager: StorageManager) {
    if (!storageManager) {
      throw new Error('StorageManager is required');
    }
    this.storageManager = storageManager;
    const defaultPetId = 'pet-cat';
    const defaultPet = INITIAL_PETS.find(p => p.id === defaultPetId) || INITIAL_PETS[0];
    
    this.userState = userState || {
      currency: 150,
      ownedPets: [defaultPetId],
      ownedItems: [],
      currentPetId: defaultPetId,
      equippedHat: undefined,
      equippedShoes: undefined,
      happiness: defaultPet.happiness,
      fullness: defaultPet.fullness,
    };

    const currentPet = this.buildCurrentPet();
    
    this.state = {
      currentPet,
      currency: this.userState.currency,
      ownedPets: this.userState.ownedPets,
      ownedItems: this.userState.ownedItems,
      shopItems: [],
    };
    this.updateShopItemsOwned();
  }

  getUserState(): UserState {
    return { ...this.userState };
  }

  getState(): TamagotchiState {
    return this.state;
  }

  getCurrentPet(): Pet {
    return this.state.currentPet;
  }

  getCurrency(): number {
    return this.userState.currency;
  }

  setCurrency(amount: number): void {
    this.userState.currency = amount;
    this.state.currency = amount;
    this.storageManager.updateCurrency(amount, this.userState);
  }

  addCurrency(amount: number): void {
    this.userState.currency += amount;
    this.state.currency = this.userState.currency;
    this.storageManager.updateCurrency(this.userState.currency, this.userState);
  }

  subtractCurrency(amount: number): void {
    this.userState.currency -= amount;
    this.state.currency = this.userState.currency;
    this.storageManager.updateCurrency(this.userState.currency, this.userState);
  }

  setCurrentPetId(petId: string): void {
    this.userState.currentPetId = petId;
    this.state.currentPet = this.buildCurrentPet();
    this.storageManager.updateCurrentPetId(petId, this.userState);
  }

  getOwnedItems(): string[] {
    return this.userState.ownedItems;
  }

  getOwnedPets(): string[] {
    return this.userState.ownedPets;
  }

  addOwnedItem(itemId: string): void {
    if (!this.userState.ownedItems.includes(itemId)) {
      this.userState.ownedItems.push(itemId);
      this.state.ownedItems = this.userState.ownedItems;
      this.updateShopItemsOwned();
      this.storageManager.addOwnedItem(itemId, this.userState);
    }
  }

  addOwnedPet(petId: string): void {
    if (!this.userState.ownedPets.includes(petId)) {
      this.userState.ownedPets.push(petId);
      this.state.ownedPets = this.userState.ownedPets;
      this.updateShopItemsOwned();
      this.storageManager.addOwnedPet(petId, this.userState);
    }
  }

  isItemOwned(itemId: string): boolean {
    return this.userState.ownedItems.includes(itemId) || this.userState.ownedPets.includes(itemId as any);
  }

  setEquippedHat(hatId: string | undefined): void {
    this.userState.equippedHat = hatId;
    this.state.currentPet = this.buildCurrentPet();
    this.storageManager.updateEquippedHat(hatId, this.userState);
  }

  setEquippedShoes(shoesId: string | undefined): void {
    this.userState.equippedShoes = shoesId;
    this.state.currentPet = this.buildCurrentPet();
    this.storageManager.updateEquippedShoes(shoesId, this.userState);
  }

  setHappiness(value: number): void {
    this.userState.happiness = Math.max(0, Math.min(100, value));
    this.state.currentPet = this.buildCurrentPet();
    this.storageManager.updateHappiness(this.userState.happiness, this.userState);
  }

  setFullness(value: number): void {
    this.userState.fullness = Math.max(0, Math.min(100, value));
    this.state.currentPet = this.buildCurrentPet();
    this.storageManager.updateFullness(this.userState.fullness, this.userState);
  }

  getShopItems(): ShopItem[] {
    return this.state.shopItems;
  }

  getShopItemsByCategory(category: string): ShopItem[] {
    return this.state.shopItems.filter(item => item.category === category);
  }

  private buildCurrentPet(): Pet {
    const initialPet = INITIAL_PETS.find(p => p.id === this.userState.currentPetId) || INITIAL_PETS[0];
    return {
      ...initialPet,
      happiness: this.userState.happiness,
      fullness: this.userState.fullness,
      equippedHat: this.userState.equippedHat,
      equippedShoes: this.userState.equippedShoes,
    };
  }

  private updateShopItemsOwned(): void {
    this.state.shopItems = INITIAL_SHOP_ITEMS.map(item => ({
      ...item,
      owned: item.owned || this.userState.ownedItems.includes(item.id) || this.userState.ownedPets.includes(item.id as any),
    }));
  }
}
