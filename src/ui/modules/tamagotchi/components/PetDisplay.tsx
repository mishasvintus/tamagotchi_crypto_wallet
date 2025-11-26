import { Pet, ShopItem, PetAccessoryConfig } from '@/tamagotchi/types';
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

  const config: PetAccessoryConfig = pet.accessoryConfig || {};

  // Функция для рендеринга изображения или эмодзи
  const renderImageOrEmoji = (imageUrl: string | undefined, emoji: string) => {
    if (imageUrl) {
      return <img src={imageUrl} alt="" className="pet-display__image" />;
    }
    return <span className="pet-display__emoji">{emoji}</span>;
  };

  return (
    <div className="pet-display">
      <div className="pet-display__sprite">
        {/* Тело (основа) */}
        <div className="pet-display__part pet-display__part--body">
          {renderImageOrEmoji(pet.imageUrl, pet.emoji)}
        </div>
        
        {/* Шляпа */}
        {hat && config.hat && (
          <div 
            className="pet-display__part pet-display__part--hat"
            style={{
              left: `${config.hat.x}%`,
              top: `${config.hat.y}%`,
              transform: `translate(-50%, -50%) scale(${config.hat.scale})${config.hat.rotation ? ` rotate(${config.hat.rotation}deg)` : ''}`,
            }}
          >
            {renderImageOrEmoji(hat.imageUrl, hat.emoji)}
          </div>
        )}
        
        {/* Левый ботинок */}
        {shoes && config.leftShoe && (
          <div 
            className="pet-display__part pet-display__part--shoe pet-display__part--left-shoe"
            style={{
              left: `${config.leftShoe.x}%`,
              top: `${config.leftShoe.y}%`,
              transform: `translate(-50%, -50%) scale(${config.leftShoe.scale})${config.leftShoe.rotation ? ` rotate(${config.leftShoe.rotation}deg)` : ''}`,
            }}
          >
            {renderImageOrEmoji(shoes.imageUrl, shoes.emoji)}
          </div>
        )}
        
        {/* Правый ботинок */}
        {shoes && config.rightShoe && (
          <div 
            className="pet-display__part pet-display__part--shoe pet-display__part--right-shoe"
            style={{
              left: `${config.rightShoe.x}%`,
              top: `${config.rightShoe.y}%`,
              transform: `translate(-50%, -50%) scale(${config.rightShoe.scale})${config.rightShoe.rotation ? ` rotate(${config.rightShoe.rotation}deg)` : ''}`,
            }}
          >
            {renderImageOrEmoji(shoes.imageUrl, shoes.emoji)}
          </div>
        )}
      </div>
    </div>
  );
}

