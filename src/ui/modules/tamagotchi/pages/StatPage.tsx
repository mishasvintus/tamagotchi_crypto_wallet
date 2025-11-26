import { TamagotchiPage } from '../TamagotchiModule';
import { tamagotchiService } from '@/services/tamagotchi-service';
import { StatButton } from '../components/StatButton';
import { CurrencyButton } from '../components/CurrencyButton';
import { BackButton } from '../components/BackButton';
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
  const pet = tamagotchiService.getPet();
  const currency = tamagotchiService.getCurrency();
  const config = statPageConfig[type];

  return (
    <div className={`stat-page stat-page--${type}`}>
      <StatButton
        emoji={config.emoji}
        value={config.getValue(pet)}
        onClick={() => {}}
        absolute={true}
      />
      <CurrencyButton 
        amount={currency} 
        onClick={() => {}}
        position="center-top"
      />
      <BackButton onClick={() => onNavigate('home')} />
    </div>
  );
}

