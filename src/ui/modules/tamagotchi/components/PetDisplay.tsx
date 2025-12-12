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
  // Убеждаемся, что scale всегда валидное число
  const bodyScale = typeof pet.scale === 'number' && pet.scale > 0 ? pet.scale : 1.0;
  const verticalOffset = typeof pet.verticalOffset === 'number' ? pet.verticalOffset : 0;

  // Получаем конфигурацию шляпы: сначала из ShopItem, если есть, иначе из pet.accessoryConfig, иначе дефолтная
  const defaultHatConfig = { x: 50, y: 8, scale: 0.75, rotation: undefined };
  const hatConfig = hat?.accessoryConfig || config.hat || defaultHatConfig;

  // Функция для рендеринга изображения или эмодзи
  const renderImageOrEmoji = (imageUrl: string | undefined, emoji: string) => {
    if (imageUrl) {
      return <img src={imageUrl} alt="" className="pet-display__image" />;
    }
    return <span className="pet-display__emoji">{emoji}</span>;
  };

  return (
    <div 
      className="pet-display"
      style={{
        top: `calc(var(--pet-display-top, 30%) + ${verticalOffset}%)`,
      }}
    >
      <div className="pet-display__sprite">
        {/* Тело (основа) */}
        <div 
          className="pet-display__part pet-display__part--body"
          style={{
            transform: `translate(-50%, -50%)`,
            width: `${100 * bodyScale}%`,
            height: `${100 * bodyScale}%`,
            willChange: 'width, height',
          }}
        >
          {renderImageOrEmoji(pet.imageUrl, pet.emoji)}
        </div>
        
        {/* Шляпа */}
        {hat && hatConfig && (
          <div 
            className="pet-display__part pet-display__part--hat"
            style={{
              left: `${hatConfig.x}%`,
              top: `${hatConfig.y}%`,
              transform: `translate(-50%, -50%) scale(${hatConfig.scale})${hatConfig.rotation ? ` rotate(${hatConfig.rotation}deg)` : ''}`,
              width: '20em',
              height: '20em',
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

