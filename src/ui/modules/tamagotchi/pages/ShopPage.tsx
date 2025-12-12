import { useState, useMemo, useEffect } from 'react';
import { TamagotchiPage } from '../TamagotchiModule';
import { tamagotchiService } from '@/services/tamagotchi-service';
import { ShopCategory, Pet, ShopItem } from '@/tamagotchi/types';
import { CurrencyButton } from '../components/CurrencyButton';
import { CategoryRow } from '../components/CategoryRow';
import { BackButton } from '../components/BackButton';
import { NavigationArrow } from '../components/NavigationArrow';
import { PetDisplay } from '../components/PetDisplay';
import { ShopActionButton } from '../components/ShopActionButton';
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
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('pets');
  const [updateKey, setUpdateKey] = useState(0); // Для принудительного обновления после покупки/выбора
  
  // Получаем актуальное состояние при каждом обновлении
  const state = tamagotchiService.getState();
  const currency = tamagotchiService.getCurrency();

  const categories = [
    { id: 'pets' as ShopCategory, emoji: '🧍' },
    { id: 'hats' as ShopCategory, emoji: '🎩' },
    { id: 'shoes' as ShopCategory, emoji: '👢' },
  ];

  // Получаем список шляп
  const availableHats = useMemo(() => {
    return state.shopItems.filter(item => item.category === 'hats');
  }, [state.shopItems]);

  // Получаем список ботинок
  const availableShoes = useMemo(() => {
    return state.shopItems.filter(item => item.category === 'shoes');
  }, [state.shopItems]);

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

  // Находим индекс текущего выбранного питомца
  const initialPetIndex = useMemo(() => {
    const index = availablePets.findIndex(pet => pet.id === state.currentPet.id);
    return index >= 0 ? index : 0;
  }, [availablePets, state.currentPet.id]);

  // Находим индекс текущей выбранной шляпы
  const initialHatIndex = useMemo(() => {
    if (!state.currentPet.equippedHat) {
      // Если шляпа не выбрана, возвращаем индекс "hat-none"
      const noneIndex = availableHats.findIndex(hat => hat.id === 'hat-none');
      return noneIndex >= 0 ? noneIndex : 0;
    }
    const index = availableHats.findIndex(hat => hat.id === state.currentPet.equippedHat);
    return index >= 0 ? index : 0;
  }, [availableHats, state.currentPet.equippedHat]);

  // Находим индекс текущих выбранных ботинок
  const initialShoeIndex = useMemo(() => {
    if (!state.currentPet.equippedShoes) {
      // Если ботинки не выбраны, возвращаем индекс "shoes-none"
      const noneIndex = availableShoes.findIndex(shoe => shoe.id === 'shoes-none');
      return noneIndex >= 0 ? noneIndex : 0;
    }
    const index = availableShoes.findIndex(shoe => shoe.id === state.currentPet.equippedShoes);
    return index >= 0 ? index : 0;
  }, [availableShoes, state.currentPet.equippedShoes]);

  const [currentPetIndex, setCurrentPetIndex] = useState(initialPetIndex);
  const [currentHatIndex, setCurrentHatIndex] = useState(initialHatIndex);
  const [currentShoeIndex, setCurrentShoeIndex] = useState(initialShoeIndex);

  // Синхронизируем индексы при изменении состояния
  useEffect(() => {
    setCurrentPetIndex(initialPetIndex);
  }, [initialPetIndex]);

  useEffect(() => {
    setCurrentHatIndex(initialHatIndex);
  }, [initialHatIndex]);

  useEffect(() => {
    setCurrentShoeIndex(initialShoeIndex);
  }, [initialShoeIndex]);

  // Текущая выбранная шляпа
  const currentHat = useMemo(() => {
    if (availableHats.length === 0) return null;
    const validIndex = currentHatIndex >= 0 && currentHatIndex < availableHats.length 
      ? currentHatIndex 
      : 0;
    const hat = availableHats[validIndex];
    // Если это "none", возвращаем null
    return hat.id === 'hat-none' ? null : hat;
  }, [availableHats, currentHatIndex]);

  // Текущие выбранные ботинки
  const currentShoes = useMemo(() => {
    if (availableShoes.length === 0) return null;
    const validIndex = currentShoeIndex >= 0 && currentShoeIndex < availableShoes.length 
      ? currentShoeIndex 
      : 0;
    const shoes = availableShoes[validIndex];
    // Если это "none", возвращаем null
    return shoes.id === 'shoes-none' ? null : shoes;
  }, [availableShoes, currentShoeIndex]);

  // Текущий просматриваемый питомец с предпросмотром шляпы/ботинок
  const displayedPet = useMemo(() => {
    if (activeCategory === 'hats' || activeCategory === 'shoes') {
      // Показываем текущего питомца с предпросмотром выбранной шляпы/ботинок
      const pet = { ...state.currentPet };
      return pet;
    } else {
      // Показываем питомцев как раньше
      if (availablePets.length === 0) return null;
      const validIndex = currentPetIndex >= 0 && currentPetIndex < availablePets.length 
        ? currentPetIndex 
        : 0;
      return availablePets[validIndex];
    }
  }, [activeCategory, availablePets, currentPetIndex, state.currentPet]);

  // Сброс индекса при смене категории - устанавливаем на текущий выбранный предмет
  const handleCategoryChange = (category: ShopCategory) => {
    setActiveCategory(category);
    if (category === 'hats') {
      setCurrentHatIndex(initialHatIndex);
    } else if (category === 'shoes') {
      setCurrentShoeIndex(initialShoeIndex);
    } else if (category === 'pets') {
      setCurrentPetIndex(initialPetIndex);
    }
  };

  const handlePrevious = () => {
    if (activeCategory === 'hats') {
      setCurrentHatIndex((prev) => {
        const newIndex = prev === 0 ? availableHats.length - 1 : prev - 1;
        return newIndex;
      });
    } else if (activeCategory === 'shoes') {
      setCurrentShoeIndex((prev) => {
        const newIndex = prev === 0 ? availableShoes.length - 1 : prev - 1;
        return newIndex;
      });
    } else {
      setCurrentPetIndex((prev) => {
        const newIndex = prev === 0 ? availablePets.length - 1 : prev - 1;
        return newIndex;
      });
    }
  };

  const handleNext = () => {
    if (activeCategory === 'hats') {
      setCurrentHatIndex((prev) => {
        const newIndex = prev === availableHats.length - 1 ? 0 : prev + 1;
        return newIndex;
      });
    } else if (activeCategory === 'shoes') {
      setCurrentShoeIndex((prev) => {
        const newIndex = prev === availableShoes.length - 1 ? 0 : prev + 1;
        return newIndex;
      });
    } else {
      setCurrentPetIndex((prev) => {
        const newIndex = prev === availablePets.length - 1 ? 0 : prev + 1;
        return newIndex;
      });
    }
  };

  // Получаем текущий просматриваемый предмет
  // Используем updateKey для обновления при изменении состояния
  const currentItem = useMemo(() => {
    // Получаем актуальное состояние
    const currentState = tamagotchiService.getState();
    if (activeCategory === 'hats') {
      if (availableHats.length === 0) return null;
      const validIndex = currentHatIndex >= 0 && currentHatIndex < availableHats.length 
        ? currentHatIndex 
        : 0;
      return availableHats[validIndex];
    } else if (activeCategory === 'shoes') {
      if (availableShoes.length === 0) return null;
      const validIndex = currentShoeIndex >= 0 && currentShoeIndex < availableShoes.length 
        ? currentShoeIndex 
        : 0;
      return availableShoes[validIndex];
    } else if (activeCategory === 'pets') {
      if (availablePets.length === 0) return null;
      const validIndex = currentPetIndex >= 0 && currentPetIndex < availablePets.length 
        ? currentPetIndex 
        : 0;
      const pet = availablePets[validIndex];
      return currentState.shopItems.find(item => item.id === pet.id) || null;
    }
    return null;
  }, [activeCategory, availableHats, availableShoes, availablePets, currentHatIndex, currentShoeIndex, currentPetIndex, updateKey]);

  // Проверяем, выбран ли текущий предмет
  // Используем updateKey для принудительного обновления при изменении состояния
  const isSelected = useMemo(() => {
    if (!currentItem) return false;
    // Получаем актуальное состояние каждый раз
    const currentState = tamagotchiService.getState();
    if (activeCategory === 'hats') {
      if (currentItem.id === 'hat-none') {
        return currentState.currentPet.equippedHat === undefined;
      }
      return currentState.currentPet.equippedHat === currentItem.id;
    } else if (activeCategory === 'shoes') {
      if (currentItem.id === 'shoes-none') {
        return currentState.currentPet.equippedShoes === undefined;
      }
      return currentState.currentPet.equippedShoes === currentItem.id;
    } else if (activeCategory === 'pets') {
      return currentState.currentPet.id === currentItem.id;
    }
    return false;
  }, [currentItem, activeCategory, updateKey]);

  // Обработчик покупки
  const handleBuy = async () => {
    if (!currentItem) return;
    const success = await tamagotchiService.buyItem(currentItem.id);
    if (success) {
      setUpdateKey(prev => prev + 1); // Обновляем компонент
    }
  };

  // Обработчик выбора
  const handleSelect = () => {
    if (!currentItem) return;
    tamagotchiService.selectItem(currentItem.id);
    // Принудительно обновляем компонент, чтобы получить актуальное состояние
    setUpdateKey(prev => prev + 1);
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
          onSelect={handleCategoryChange}
        />
      </div>
      {displayedPet && (
        <PetDisplay 
          key={`${displayedPet.id}-${activeCategory === 'hats' ? currentHat?.id || 'none' : state.currentPet.equippedHat || 'none'}-${activeCategory === 'shoes' ? currentShoes?.id || 'none' : state.currentPet.equippedShoes || 'none'}-${updateKey}`} 
          pet={displayedPet}
          previewHat={activeCategory === 'hats' ? currentHat : (state.currentPet.equippedHat ? state.shopItems.find(item => item.id === state.currentPet.equippedHat) || undefined : undefined)}
          previewShoes={activeCategory === 'shoes' ? currentShoes : (state.currentPet.equippedShoes ? state.shopItems.find(item => item.id === state.currentPet.equippedShoes) || undefined : undefined)}
        />
      )}
      <NavigationArrow direction="left" onClick={handlePrevious} />
      <NavigationArrow direction="right" onClick={handleNext} />
      {currentItem && (
        <ShopActionButton
          item={currentItem}
          isSelected={isSelected}
          onBuy={handleBuy}
          onSelect={handleSelect}
          verticalPosition="25%"
        />
      )}
      <BackButton onClick={() => onNavigate('home')} />
    </div>
  );
}

