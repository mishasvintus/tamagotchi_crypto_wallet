import { TamagotchiPage } from '../TamagotchiModule';
import { tamagotchiService } from '@/services/tamagotchi-service';
import { CurrencyButton } from '../components/CurrencyButton';
import { StatsRow, type StatItem } from '../components/StatsRow';
import { PetDisplay } from '../components/PetDisplay';
import './HomePage.css';

interface HomePageProps {
  onNavigate: (page: TamagotchiPage) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const currency = tamagotchiService.getCurrency();
  const pet = tamagotchiService.getPet();

  const stats: StatItem[] = [
    {
      emoji: '😊',
      value: pet.happiness,
      onClick: () => onNavigate('entertainment'),
    },
    {
      emoji: '🍴',
      value: pet.fullness,
      onClick: () => onNavigate('food'),
    },
  ];

  return (
    <div className="home-page">
      <CurrencyButton 
        amount={currency} 
        onClick={() => onNavigate('shop')}
        position="center-top"
      />
      <PetDisplay pet={pet} />
      <div className="home-page__stats">
        <StatsRow stats={stats} />
      </div>
    </div>
  );
}

