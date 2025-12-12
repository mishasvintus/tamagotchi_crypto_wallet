import { useState, useEffect } from 'react';
import { eventBus } from '@/services/event-bus';
import { tamagotchiService } from '@/services/tamagotchi-service';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { StatPage } from './pages/StatPage';
import { MoneyAnimation } from './components/MoneyAnimation';
import './TamagotchiModule.css';

export type TamagotchiPage = 'home' | 'shop' | 'entertainment' | 'food';

export function TamagotchiModule() {
  const [currentPage, setCurrentPage] = useState<TamagotchiPage>('home');
  const [moneyAnimation, setMoneyAnimation] = useState<{ amount: number; key: number } | null>(null);

  const navigateToPage = (page: TamagotchiPage) => {
    setCurrentPage(page);
  };

  // Интеграция с событиями кошелька
  useEffect(() => {
    // Слушаем событие создания кошелька
    const unsubscribeCreated = eventBus.on('wallet:created', (data) => {
      tamagotchiService.rewardForWalletAction('created');
      console.log('🎉 Кошелёк создан! Питомец получил награду!', data);
      setMoneyAnimation({ amount: 50, key: Date.now() });
    });

    // Слушаем событие отправки транзакции
    const unsubscribeSent = eventBus.on('wallet:transaction-sent', (data: any) => {
      tamagotchiService.rewardForWalletAction('transaction-sent');
      console.log('📤 Транзакция отправлена! Питомец радуется!', data);
      setMoneyAnimation({ amount: 10, key: Date.now() });
    });

    // Слушаем событие получения транзакции
    const unsubscribeReceived = eventBus.on('wallet:transaction-received', (data: any) => {
      tamagotchiService.rewardForWalletAction('transaction-received');
      console.log('📥 Транзакция получена! Питомец празднует!', data);
      
      if (data?.value) {
        const amount = parseFloat(data.value);
        const displayAmount = Math.ceil(amount * 100) || 15;
        setMoneyAnimation({ amount: displayAmount, key: Date.now() });
      } else {
        setMoneyAnimation({ amount: 15, key: Date.now() });
      }
    });

    // Слушаем событие изменения баланса
    const unsubscribeBalance = eventBus.on('wallet:balance-changed', (data) => {
      // Опциональная реакция на изменение баланса
      if (data && parseFloat(data.balance) > parseFloat(data.previousBalance || '0')) {
        console.log('💰 Баланс увеличился!', data);
      }
    });

    // Очистка подписок при размонтировании
    return () => {
      unsubscribeCreated();
      unsubscribeSent();
      unsubscribeReceived();
      unsubscribeBalance();
    };
  }, []);

  return (
    <div className="tamagotchi-module">
      {currentPage === 'home' && <HomePage onNavigate={navigateToPage} />}
      {currentPage === 'shop' && <ShopPage onNavigate={navigateToPage} />}
      {currentPage === 'entertainment' && <StatPage type="entertainment" onNavigate={navigateToPage} />}
      {currentPage === 'food' && <StatPage type="food" onNavigate={navigateToPage} />}
      {moneyAnimation && (
        <MoneyAnimation
          key={moneyAnimation.key}
          amount={moneyAnimation.amount}
          onComplete={() => setMoneyAnimation(null)}
        />
      )}
    </div>
  );
}


