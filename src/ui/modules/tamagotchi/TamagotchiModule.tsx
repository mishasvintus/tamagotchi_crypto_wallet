import { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { StatPage } from './pages/StatPage';
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
      {currentPage === 'entertainment' && <StatPage type="entertainment" onNavigate={navigateToPage} />}
      {currentPage === 'food' && <StatPage type="food" onNavigate={navigateToPage} />}
    </div>
  );
}


