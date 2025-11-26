import { FoodItem } from '@/tamagotchi/types';
import './FoodButton.css';

interface FoodButtonProps {
  food: FoodItem;
  onClick: () => void;
}

export function FoodButton({ food, onClick }: FoodButtonProps) {
  return (
    <button className="food-button" onClick={onClick}>
      <span className="food-button__emoji">{food.emoji}</span>
    </button>
  );
}


