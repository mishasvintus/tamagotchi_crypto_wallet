import './ActionButton.css';

interface ActionButtonProps {
  emoji: string;
  onClick: () => void;
  activeColor?: string;
}

export function ActionButton({ emoji, onClick, activeColor = '#4caf50' }: ActionButtonProps) {
  return (
    <button 
      className="action-button" 
      onClick={onClick}
      style={{ '--action-button-active-color': activeColor } as React.CSSProperties}
    >
      <span className="action-button__emoji">{emoji}</span>
    </button>
  );
}

