import { useState } from 'react';
import { TamagotchiPage } from '../TamagotchiModule';
import { tamagotchiService } from '@/services/tamagotchi-service';
import { StatButton } from '../components/StatButton';
import { CurrencyButton } from '../components/CurrencyButton';
import { BackButton } from '../components/BackButton';
import { ActionRow, type ActionItem } from '../components/ActionRow';
import { PetDisplay } from '../components/PetDisplay';
import './StatPage.css';

export type StatPageType = 'entertainment' | 'food';

interface StatPageProps {
  type: StatPageType;
  onNavigate: (page: TamagotchiPage) => void;
}

const statPageConfig = {
  entertainment: {
    emoji: '😊',
    getValue: (pet: ReturnType<typeof tamagotchiService.getPet>) => pet.happiness,
  },
  food: {
    emoji: '🍴',
    getValue: (pet: ReturnType<typeof tamagotchiService.getPet>) => pet.fullness,
  },
};

export function StatPage({ type, onNavigate }: StatPageProps) {
  const [updateKey, setUpdateKey] = useState(0);
  const pet = tamagotchiService.getPet();
  const currency = tamagotchiService.getCurrency();
  const config = statPageConfig[type];

  const activities = type === 'entertainment' ? tamagotchiService.getActivityItems() : [];
  const foods = type === 'food' ? tamagotchiService.getFoodItems() : [];

  const handleActivityClick = async (activityId: string) => {
    await tamagotchiService.playWithPet(activityId);
    setUpdateKey(prev => prev + 1);
  };

  const handleFoodClick = async (foodId: string) => {
    await tamagotchiService.feedPet(foodId);
    setUpdateKey(prev => prev + 1);
  };

  const actionItems: ActionItem[] = type === 'entertainment'
    ? activities.map(activity => ({
        emoji: activity.emoji,
        onClick: () => handleActivityClick(activity.id),
        activeColor: '#4caf50',
      }))
    : foods.map(food => ({
        emoji: food.emoji,
        onClick: () => handleFoodClick(food.id),
        activeColor: '#ff9800',
      }));

  return (
    <div className={`stat-page stat-page--${type}`} key={updateKey}>
      <StatButton
        emoji={config.emoji}
        value={config.getValue(pet)}
        onClick={() => {}}
        absolute={true}
      />
      <CurrencyButton 
        amount={currency} 
        onClick={() => onNavigate('shop')}
        position="center-top"
      />
      <PetDisplay pet={pet} />
      {actionItems.length > 0 && (
        <div className="stat-page__actions">
          <ActionRow actions={actionItems} />
        </div>
      )}
      <BackButton onClick={() => onNavigate('home')} />
    </div>
  );
}

