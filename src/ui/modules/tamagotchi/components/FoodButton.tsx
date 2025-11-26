import { FoodItem } from '@/tamagotchi/types';
import { ActionButton } from './ActionButton';

interface FoodButtonProps {
  food: FoodItem;
  onClick: () => void;
}

export function FoodButton({ food, onClick }: FoodButtonProps) {
  return (
    <ActionButton 
      emoji={food.emoji} 
      onClick={onClick}
      activeColor="#ff9800"
    />
  );
}


