import './CurrencyButton.css';

interface CurrencyButtonProps {
  amount: number;
  onClick: () => void;
  position?: 'center-top' | 'right-top';
}

export function CurrencyButton({ amount, onClick, position = 'center-top' }: CurrencyButtonProps) {
  const positionClass = position === 'center-top' ? 'currency-button--center-top' : 'currency-button--right-top';
  
  return (
    <button className={`currency-button ${positionClass}`} onClick={onClick}>
      <span className="currency-button__emoji">💰</span>
      <span className="currency-button__amount">{amount}</span>
    </button>
  );
}

