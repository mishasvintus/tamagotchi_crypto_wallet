export interface UserState {
  currency: number;
  ownedPets: string[];
  ownedItems: string[];
  currentPetId: string;
  equippedHat: string | undefined;
  equippedShoes: string | undefined;
  happiness: number;
  fullness: number;
}

