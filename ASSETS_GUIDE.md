# Руководство по использованию изображений

## Формат изображений

**Рекомендуется использовать SVG** по следующим причинам:
- Масштабируется без потери качества
- Малый размер файла
- Легко менять цвета через CSS
- Поддержка анимаций

**Альтернатива: PNG**
- Используйте PNG, если нужны сложные текстуры/градиенты
- Рекомендуемый размер: 512x512px или 1024x1024px для высокого качества
- Используйте прозрачный фон (PNG с альфа-каналом)

## Структура файлов

```
public/
  assets/
    pets/
      cat.svg (или cat.png)
      dog.svg
      dragon.svg
    accessories/
      hats/
        wizard-hat.svg
        party-hat.svg
      shoes/
        sneakers.svg
        boots.svg
```

## Конфигурация позиционирования аксессуаров

Для каждого питомца нужно настроить позиционирование аксессуаров в `PetAccessoryConfig`:

```typescript
{
  hat: {
    x: 50,      // 50% от ширины питомца (центр)
    y: 10,      // 10% от высоты питомца (сверху)
    scale: 0.8, // 80% от исходного размера
    rotation: 0 // без поворота
  },
  leftShoe: {
    x: 30,      // 30% от ширины (левее центра)
    y: 85,      // 85% от высоты (внизу)
    scale: 0.6,
    rotation: -5 // небольшой поворот
  },
  rightShoe: {
    x: 70,      // 70% от ширины (правее центра)
    y: 85,
    scale: 0.6,
    rotation: 5
  }
}
```

## Примеры использования

### В типах Pet:
```typescript
{
  id: 'cat-1',
  name: 'Котик',
  imageUrl: '/assets/pets/cat.svg',
  accessoryConfig: {
    hat: { x: 50, y: 5, scale: 0.7 },
    leftShoe: { x: 35, y: 90, scale: 0.5 },
    rightShoe: { x: 65, y: 90, scale: 0.5 }
  }
}
```

### В типах ShopItem:
```typescript
{
  id: 'hat-wizard',
  name: 'Волшебная шляпа',
  imageUrl: '/assets/accessories/hats/wizard-hat.svg',
  category: 'hats',
  price: 50,
  owned: false
}
```

