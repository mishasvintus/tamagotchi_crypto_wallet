import { Pet, ShopItem } from '@/tamagotchi/types';
import { tamagotchiService } from '@/services/tamagotchi-service';
import './PetDisplay.css';

interface PetDisplayProps {
  pet: Pet;
  previewHat?: ShopItem | null; // Для предпросмотра в магазине
  previewShoes?: ShopItem | null; // Для предпросмотра в магазине
}

export function PetDisplay({ pet, previewHat, previewShoes }: PetDisplayProps) {
  // Получаем аксессуары (используем preview если есть, иначе equipped)
  const hat = previewHat !== undefined 
    ? previewHat 
    : (pet.equippedHat 
        ? tamagotchiService.getState().shopItems.find(i => i.id === pet.equippedHat)
        : null);
  
  const shoes = previewShoes !== undefined
    ? previewShoes
    : (pet.equippedShoes
        ? tamagotchiService.getState().shopItems.find(i => i.id === pet.equippedShoes)
        : null);

  return (
    <div className="pet-display">
      <div className="pet-display__sprite">
        {/* Шляпа (сверху) */}
        {hat && (
          <div className="pet-display__part pet-display__part--hat">
            {hat.emoji}
          </div>
        )}
        {/* Тело (посередине) */}
        <div className="pet-display__part pet-display__part--body">
          {pet.emoji}
        </div>
        {/* Ботинки (снизу) */}
        {shoes && (
          <div className="pet-display__part pet-display__part--shoes">
            {shoes.emoji}
          </div>
        )}
      </div>
      <div className="pet-display__info">
        <div className="pet-display__name">{pet.name}</div>
      </div>
    </div>
  );
}

