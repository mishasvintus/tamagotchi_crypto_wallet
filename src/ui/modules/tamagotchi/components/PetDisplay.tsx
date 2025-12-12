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

  // Получаем конфигурацию ботинок: сначала из ShopItem, если есть, иначе из pet.accessoryConfig, иначе дефолтная
  const defaultShoesConfig = { x: 50, y: 88, gap: 30, scale: 0.55, rotation: undefined };
  const shoesConfig = shoes?.accessoryConfig 
    ? { 
        x: shoes.accessoryConfig.x ?? defaultShoesConfig.x,
        y: shoes.accessoryConfig.y ?? defaultShoesConfig.y,
        gap: shoes.accessoryConfig.gap ?? defaultShoesConfig.gap,
        scale: shoes.accessoryConfig.scale ?? defaultShoesConfig.scale,
        rotation: shoes.accessoryConfig.rotation ?? defaultShoesConfig.rotation,
      }
    : config.shoes || defaultShoesConfig;

  // Вычисляем позиции левого и правого ботинка на основе конфигурации пары
  const leftShoeX = shoesConfig.x - shoesConfig.gap / 2;
  const rightShoeX = shoesConfig.x + shoesConfig.gap / 2;

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
        top: `var(--pet-display-top, 30%)`,
      }}
    >
      <div className="pet-display__sprite">
        {/* Тело (основа) */}
        <div 
          className="pet-display__part pet-display__part--body"
          style={{
            transform: `translate(-50%, calc(-50% + ${verticalOffset}%))`,
            width: `${100 * bodyScale}%`,
            height: `${100 * bodyScale}%`,
            willChange: 'width, height',
          }}
        >
          {renderImageOrEmoji(pet.imageUrl, pet.emoji)}
        </div>
        
        {/* Левый ботинок */}
        {shoes && shoesConfig && (
          <div 
            className="pet-display__part pet-display__part--shoe pet-display__part--left-shoe"
            style={{
              left: `${leftShoeX}%`,
              top: `${shoesConfig.y}%`,
              transform: `translate(-50%, -50%) scale(${shoesConfig.scale})${shoesConfig.rotation ? ` rotate(${shoesConfig.rotation}deg)` : ''}`,
              width: '20em',
              height: '20em',
            }}
          >
            {renderImageOrEmoji(shoes.imageUrl, shoes.emoji)}
          </div>
        )}
        
        {/* Правый ботинок */}
        {shoes && shoesConfig && (
          <div 
            className="pet-display__part pet-display__part--shoe pet-display__part--right-shoe"
            style={{
              left: `${rightShoeX}%`,
              top: `${shoesConfig.y}%`,
              transform: `translate(-50%, -50%) scale(${shoesConfig.scale})${shoesConfig.rotation ? ` rotate(${shoesConfig.rotation}deg)` : ''}`,
              width: '20em',
              height: '20em',
            }}
          >
            {renderImageOrEmoji(shoes.imageUrl, shoes.emoji)}
          </div>
        )}
      </div>
      
      {/* Шляпа - позиционируется относительно pet-display, независимо от verticalOffset */}
      {hat && hatConfig && (
        <div 
          className="pet-display__part pet-display__part--hat pet-display__part--hat-independent"
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
    </div>
  );
}

