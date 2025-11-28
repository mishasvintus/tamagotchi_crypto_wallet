import { ShopCategory } from '@/tamagotchi/types';
import { CategoryButton } from './CategoryButton';
import './CategoryRow.css';

interface CategoryRowProps {
  categories: { id: ShopCategory; emoji: string }[];
  activeCategory: ShopCategory;
  onSelect: (category: ShopCategory) => void;
}

export function CategoryRow({ categories, activeCategory, onSelect }: CategoryRowProps) {
  return (
    <div className="category-row">
      {categories.map((category) => (
        <CategoryButton
          key={category.id}
          emoji={category.emoji}
          active={activeCategory === category.id}
          onClick={() => onSelect(category.id)}
        />
      ))}
    </div>
  );
}


