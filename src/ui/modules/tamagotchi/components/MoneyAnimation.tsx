import { useEffect, useState } from 'react';
import './MoneyAnimation.css';

interface MoneyAnimationProps {
  amount: number;
  onComplete: () => void;
}

export function MoneyAnimation({ amount, onComplete }: MoneyAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const banknotes = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="money-animation">
      {banknotes.map((index) => (
        <div
          key={index}
          className={`money-animation__banknote money-animation__banknote--${index + 1}`}
          style={{
            '--delay': `${index * 0.1}s`,
          } as React.CSSProperties}
        >
          💰
        </div>
      ))}
      <div className="money-animation__amount">+{amount} 💰</div>
    </div>
  );
}

