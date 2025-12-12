import './ShopActionButton.css';

interface ShopActionButtonProps {
  item: {
    id: string;
    price: number;
    owned: boolean;
  };
  isSelected: boolean;
  onBuy: () => void;
  onSelect: () => void;
  verticalPosition?: string; // Позиция по вертикали в процентах
}

export function ShopActionButton({ 
  item, 
  isSelected, 
  onBuy, 
  onSelect,
  verticalPosition = '75%'
}: ShopActionButtonProps) {
  const handleClick = () => {
    if (!item.owned) {
      onBuy();
    } else if (!isSelected) {
      onSelect();
    }
    // Если предмет выбран, кнопка неактивна
  };

  const getButtonText = () => {
    if (!item.owned) {
      return `${item.price} 💰`;
    } else if (isSelected) {
      return 'Выбрано';
    } else {
      return 'Выбрать';
    }
  };

  const isDisabled = item.owned && isSelected;
  const isPriceMode = !item.owned;

  return (
    <button
      className={`shop-action-button ${isDisabled ? 'shop-action-button--disabled' : ''} ${isPriceMode ? 'shop-action-button--price' : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
      style={{
        bottom: verticalPosition,
      }}
    >
      {getButtonText()}
    </button>
  );
}

