import './CategoryButton.css';

interface CategoryButtonProps {
  emoji: string;
  active: boolean;
  onClick: () => void;
}

export function CategoryButton({ emoji, active, onClick }: CategoryButtonProps) {
  return (
    <button
      className={`category-button ${active ? 'category-button--active' : ''}`}
      onClick={onClick}
    >
      <span className="category-button__emoji">{emoji}</span>
    </button>
  );
}


