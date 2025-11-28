import { useState, useMemo } from 'react';
import { TamagotchiPage } from '../TamagotchiModule';
import { tamagotchiService } from '@/services/tamagotchi-service';
import { ShopCategory, Pet, ShopItem } from '@/tamagotchi/types';
import { CurrencyButton } from '../components/CurrencyButton';
import { CategoryRow } from '../components/CategoryRow';
import { BackButton } from '../components/BackButton';
import { NavigationArrow } from '../components/NavigationArrow';
import { PetDisplay } from '../components/PetDisplay';
import './ShopPage.css';

interface ShopPageProps {
  onNavigate: (page: TamagotchiPage) => void;
}

const DEFAULT_ACCESSORY_CONFIG = {
  hat: { x: 50, y: 8, scale: 0.75 },
  leftShoe: { x: 35, y: 88, scale: 0.55 },
  rightShoe: { x: 65, y: 88, scale: 0.55 },
};

export function ShopPage({ onNavigate }: ShopPageProps) {
  const currency = tamagotchiService.getCurrency();
  const state = tamagotchiService.getState();
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('pets');
  const [currentPetIndex, setCurrentPetIndex] = useState(0);

  const categories = [
    { id: 'pets' as ShopCategory, emoji: '🧍' },
    { id: 'hats' as ShopCategory, emoji: '🎩' },
    { id: 'shoes' as ShopCategory, emoji: '👢' },
  ];

  // Получаем список питомцев из shopItems - предзагружаем все данные заранее
  const availablePets = useMemo(() => {
    const petShopItems = state.shopItems.filter(item => item.category === 'pets');
    const currentPet = state.currentPet;
    
    return petShopItems.map((shopItem: ShopItem): Pet => {
      // Находим текущего питомца, если это он, чтобы сохранить его состояние
      if (currentPet.id === shopItem.id) {
        return currentPet;
      }
      
      // Ищем начальные данные питомца из INITIAL_PETS - всегда должны быть доступны
      const initialPet = tamagotchiService.getInitialPet(shopItem.id);
      if (initialPet) {
        // Используем данные из INITIAL_PETS, но с дефолтными значениями для happiness и fullness
        // Убеждаемся, что scale и verticalOffset всегда определены
        return {
          ...initialPet,
          happiness: 50,
          fullness: 50,
          scale: initialPet.scale ?? 1.0,
          verticalOffset: initialPet.verticalOffset ?? 0,
        };
      }
      
      // Иначе создаем Pet из ShopItem с дефолтными значениями
      return {
        id: shopItem.id,
        name: shopItem.name,
        emoji: shopItem.emoji,
        imageUrl: shopItem.imageUrl,
        happiness: 50,
        fullness: 50,
        accessoryConfig: DEFAULT_ACCESSORY_CONFIG,
        scale: 1.0,
        verticalOffset: 0,
      };
    });
  }, [state.shopItems, state.currentPet]);

  // Текущий просматриваемый питомец - убеждаемся, что индекс валидный
  const displayedPet = useMemo(() => {
    if (availablePets.length === 0) return null;
    const validIndex = currentPetIndex >= 0 && currentPetIndex < availablePets.length 
      ? currentPetIndex 
      : 0;
    return availablePets[validIndex];
  }, [availablePets, currentPetIndex]);

  const handlePrevious = () => {
    setCurrentPetIndex((prev) => {
      const newIndex = prev === 0 ? availablePets.length - 1 : prev - 1;
      return newIndex;
    });
  };

  const handleNext = () => {
    setCurrentPetIndex((prev) => {
      const newIndex = prev === availablePets.length - 1 ? 0 : prev + 1;
      return newIndex;
    });
  };

  return (
    <div className="shop-page">
      <CurrencyButton 
        amount={currency} 
        onClick={() => {}}
        position="center-top"
      />
      <div className="shop-page__categories">
        <CategoryRow
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>
      {displayedPet && <PetDisplay key={displayedPet.id} pet={displayedPet} />}
      <NavigationArrow direction="left" onClick={handlePrevious} />
      <NavigationArrow direction="right" onClick={handleNext} />
      <BackButton onClick={() => onNavigate('home')} />
    </div>
  );
}

