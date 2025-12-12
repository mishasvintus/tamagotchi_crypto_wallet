import { tamagotchiService } from './tamagotchi-service';
import { INITIAL_PETS } from './constants';

export const adminCommands = {
  addMoney(amount: number): void {
    const stateManager = (tamagotchiService as any).stateManager;
    if (stateManager) {
      stateManager.addCurrency(amount);
      console.log(`✅ Добавлено ${amount} 💰. Текущий баланс: ${tamagotchiService.getCurrency()} 💰`);
    } else {
      console.error('❌ Не удалось получить доступ к stateManager');
    }
  },

  setMoney(amount: number): void {
    const stateManager = (tamagotchiService as any).stateManager;
    if (stateManager) {
      stateManager.setCurrency(amount);
      console.log(`✅ Установлен баланс: ${amount} 💰`);
    } else {
      console.error('❌ Не удалось получить доступ к stateManager');
    }
  },

  fastForwardTime(minutes: number): void {
    const decreaseTimer = (tamagotchiService as any).decreaseTimer;
    const stateManager = (tamagotchiService as any).stateManager;
    if (decreaseTimer && stateManager) {
      const now = Date.now();
      const milliseconds = minutes * 60 * 1000;
      const oldLastDecrease = (decreaseTimer as any).lastDecreaseTime;
      (decreaseTimer as any).lastDecreaseTime = oldLastDecrease - milliseconds;
      
      const tenMinutesInMs = 10 * 60 * 1000;
      let happinessDecreased = 0;
      let fullnessDecreased = 0;
      
      for (let i = 0; i < minutes; i++) {
        const checkTime = (decreaseTimer as any).lastDecreaseTime + (i * 60000);
        const lastFullHappiness = (decreaseTimer as any).lastFullHappinessTime;
        const lastFullFullness = (decreaseTimer as any).lastFullFullnessTime;
        
        const canDecreaseHappiness = lastFullHappiness === null || (checkTime - lastFullHappiness) >= tenMinutesInMs;
        const canDecreaseFullness = lastFullFullness === null || (checkTime - lastFullFullness) >= tenMinutesInMs;
        
        if (canDecreaseHappiness) {
          const current = stateManager.getCurrentPet().happiness;
          if (current > 0) {
            stateManager.setHappiness(Math.max(0, current - 1));
            happinessDecreased++;
          }
        }
        if (canDecreaseFullness) {
          const current = stateManager.getCurrentPet().fullness;
          if (current > 0) {
            stateManager.setFullness(Math.max(0, current - 1));
            fullnessDecreased++;
          }
        }
      }
      
      (decreaseTimer as any).lastDecreaseTime = now;
      (decreaseTimer as any).onSave();
      
      console.log(`✅ Время прокручено на ${minutes} минут. Счастье уменьшено на ${happinessDecreased}, сытость на ${fullnessDecreased}.`);
    } else {
      console.error('❌ Не удалось получить доступ к decreaseTimer или stateManager');
    }
  },

  resetInventory(): void {
    const stateManager = (tamagotchiService as any).stateManager;
    if (stateManager) {
      const userState = stateManager.getUserState();
      userState.ownedItems = [];
      userState.ownedPets = ['pet-cat'];
      userState.equippedHat = undefined;
      userState.equippedShoes = undefined;
      const storageManager = (stateManager as any).storageManager;
      if (storageManager) {
        storageManager.saveUserState(userState);
        stateManager.updateShopItemsOwned();
        console.log('✅ Инвентарь обнулен. Остался только питомец по умолчанию (кошка).');
      } else {
        console.error('❌ Не удалось получить доступ к storageManager');
      }
    } else {
      console.error('❌ Не удалось получить доступ к stateManager');
    }
  },

  resetAll(): void {
    const stateManager = (tamagotchiService as any).stateManager;
    if (stateManager) {
      const defaultPetId = 'pet-cat';
      const defaultPet = INITIAL_PETS.find(p => p.id === defaultPetId) || INITIAL_PETS[0];
      
      stateManager.setCurrency(150);
      stateManager.setCurrentPetId(defaultPetId);
      stateManager.setHappiness(defaultPet.happiness);
      stateManager.setFullness(defaultPet.fullness);
      
      const userState = stateManager.getUserState();
      userState.ownedItems = [];
      userState.ownedPets = [defaultPetId];
      userState.equippedHat = undefined;
      userState.equippedShoes = undefined;
      
      const storageManager = (stateManager as any).storageManager;
      if (storageManager) {
        storageManager.saveUserState(userState);
        stateManager.updateShopItemsOwned();
        console.log('✅ Все данные сброшены до начального состояния.');
      } else {
        console.error('❌ Не удалось получить доступ к storageManager');
      }
    } else {
      console.error('❌ Не удалось получить доступ к stateManager');
    }
  },

  setHappiness(value: number): void {
    const stateManager = (tamagotchiService as any).stateManager;
    if (stateManager) {
      stateManager.setHappiness(Math.max(0, Math.min(100, value)));
      console.log(`✅ Счастье установлено: ${value}`);
    } else {
      console.error('❌ Не удалось получить доступ к stateManager');
    }
  },

  setFullness(value: number): void {
    const stateManager = (tamagotchiService as any).stateManager;
    if (stateManager) {
      stateManager.setFullness(Math.max(0, Math.min(100, value)));
      console.log(`✅ Сытость установлена: ${value}`);
    } else {
      console.error('❌ Не удалось получить доступ к stateManager');
    }
  },

  giveItem(itemId: string): void {
    const stateManager = (tamagotchiService as any).stateManager;
    if (stateManager) {
      stateManager.addOwnedItem(itemId);
      console.log(`✅ Предмет "${itemId}" добавлен в инвентарь.`);
    } else {
      console.error('❌ Не удалось получить доступ к stateManager');
    }
  },

  help(): void {
    console.log(`
🎮 Админские команды для Tamagotchi:

💰 Деньги:
  admin.addMoney(amount)     - Добавить деньги
  admin.setMoney(amount)      - Установить баланс

⏰ Время:
  admin.fastForwardTime(minutes) - Прокрутить время на N минут

📦 Инвентарь:
  admin.resetInventory()      - Обнулить инвентарь (оставить только кошку)
  admin.giveItem(itemId)      - Добавить предмет в инвентарь

😊 Статы:
  admin.setHappiness(value)   - Установить счастье (0-100)
  admin.setFullness(value)    - Установить сытость (0-100)

🔄 Сброс:
  admin.resetAll()            - Полный сброс всех данных

ℹ️ Справка:
  admin.help()                - Показать эту справку

Примеры:
  admin.addMoney(1000)
  admin.fastForwardTime(30)
  admin.giveItem('hat-cap')
  admin.setHappiness(100)
    `);
  },
};

if (typeof window !== 'undefined') {
  (window as any).admin = adminCommands;
  console.log('🎮 Админские команды доступны через window.admin. Введите admin.help() для справки.');
}

