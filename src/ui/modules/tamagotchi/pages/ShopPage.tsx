import { TamagotchiPage } from '../TamagotchiModule';
import { tamagotchiService } from '@/services/tamagotchi-service';
import { CurrencyButton } from '../components/CurrencyButton';
import { BackButton } from '../components/BackButton';
import './ShopPage.css';

interface ShopPageProps {
  onNavigate: (page: TamagotchiPage) => void;
}

export function ShopPage({ onNavigate }: ShopPageProps) {
  const currency = tamagotchiService.getCurrency();

  return (
    <div className="shop-page">
      <CurrencyButton 
        amount={currency} 
        onClick={() => {}}
        position="right-top"
      />
      <BackButton onClick={() => onNavigate('home')} />
    </div>
  );
}

