import { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { EntertainmentPage } from './pages/EntertainmentPage';
import { FoodPage } from './pages/FoodPage';
import './TamagotchiModule.css';

export type TamagotchiPage = 'home' | 'shop' | 'entertainment' | 'food';

export function TamagotchiModule() {
  const [currentPage, setCurrentPage] = useState<TamagotchiPage>('home');

  const navigateToPage = (page: TamagotchiPage) => {
    setCurrentPage(page);
  };

  return (
    <div className="tamagotchi-module">
      {currentPage === 'home' && <HomePage onNavigate={navigateToPage} />}
      {currentPage === 'shop' && <ShopPage onNavigate={navigateToPage} />}
      {currentPage === 'entertainment' && <EntertainmentPage onNavigate={navigateToPage} />}
      {currentPage === 'food' && <FoodPage onNavigate={navigateToPage} />}
    </div>
  );
}


