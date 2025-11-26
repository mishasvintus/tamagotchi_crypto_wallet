import { TamagotchiPage } from '../TamagotchiModule';
import { tamagotchiService } from '@/services/tamagotchi-service';
import { StatButton } from '../components/StatButton';
import { CurrencyButton } from '../components/CurrencyButton';
import { BackButton } from '../components/BackButton';
import './EntertainmentPage.css';

interface EntertainmentPageProps {
  onNavigate: (page: TamagotchiPage) => void;
}

export function EntertainmentPage({ onNavigate }: EntertainmentPageProps) {
  const pet = tamagotchiService.getPet();
  const currency = tamagotchiService.getCurrency();

  return (
    <div className="entertainment-page">
      <StatButton
        emoji="😊"
        value={pet.happiness}
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

