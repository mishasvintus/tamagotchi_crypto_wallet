import { TamagotchiPage } from '../TamagotchiModule';
import { tamagotchiService } from '@/services/tamagotchi-service';
import { StatButton } from '../components/StatButton';
import { CurrencyButton } from '../components/CurrencyButton';
import { BackButton } from '../components/BackButton';
import './FoodPage.css';

interface FoodPageProps {
  onNavigate: (page: TamagotchiPage) => void;
}

export function FoodPage({ onNavigate }: FoodPageProps) {
  const pet = tamagotchiService.getPet();
  const currency = tamagotchiService.getCurrency();

  return (
    <div className="food-page">
      <StatButton
        emoji="🍴"
        value={pet.fullness}
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

