import { ShopItem } from '@/tamagotchi/types';
import './ShopItemCard.css';

interface ShopItemCardProps {
  item: ShopItem;
  onBuy: (itemId: string) => void;
  onSelect: (itemId: string) => void;
}

export function ShopItemCard({ item, onBuy, onSelect }: ShopItemCardProps) {
  return (
    <div className="shop-item-card">
      <div className="shop-item-card__emoji">{item.emoji}</div>
      <div className="shop-item-card__name">{item.name}</div>
      {item.owned ? (
        <button
          className="shop-item-card__button shop-item-card__button--select"
          onClick={() => onSelect(item.id)}
        >
          Выбрать
        </button>
      ) : (
        <button
          className="shop-item-card__button shop-item-card__button--buy"
          onClick={() => onBuy(item.id)}
        >
          💰 {item.price}
        </button>
      )}
    </div>
  );
}


