import './NavigationArrow.css';

interface NavigationArrowProps {
  direction: 'left' | 'right';
  onClick: () => void;
}

export function NavigationArrow({ direction, onClick }: NavigationArrowProps) {
  const arrowSymbol = direction === 'left' ? '◀' : '▶';
  
  return (
    <button 
      className={`navigation-arrow navigation-arrow--${direction}`}
      onClick={onClick}
    >
      <span className="navigation-arrow__symbol">{arrowSymbol}</span>
    </button>
  );
}

