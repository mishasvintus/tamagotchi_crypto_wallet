/**
 * Event Bus для связи между модулями
 * Позволяет модулям кошелька и тамагочи обмениваться событиями
 */

type EventCallback = (data?: any) => void;

/**
 * Типы событий кошелька
 */
export type WalletEventType =
    | 'wallet:created'
    | 'wallet:unlocked'
    | 'wallet:transaction-sent'
    | 'wallet:transaction-received'
    | 'wallet:balance-changed';

/**
 * Данные события создания кошелька
 */
export interface WalletCreatedEvent {
    address: string;
}

/**
 * Данные события транзакции
 */
export interface TransactionEvent {
    hash: string;
    from: string;
    to: string;
    value: string; // в ETH
    type: 'sent' | 'received';
}

/**
 * Данные события изменения баланса
 */
export interface BalanceChangedEvent {
    address: string;
    balance: string; // в ETH
    previousBalance?: string;
}

/**
 * Event Bus для связи модулей
 */
class EventBus {
    private listeners: Map<string, Set<EventCallback>> = new Map();

    /**
     * Подписка на событие
     * @param eventType - Тип события
     * @param callback - Функция-обработчик
     * @returns Функция для отписки
     */
    on(eventType: string, callback: EventCallback): () => void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType)!.add(callback);

        // Возвращаем функцию для отписки
        return () => {
            this.off(eventType, callback);
        };
    }

    /**
     * Отписка от события
     * @param eventType - Тип события
     * @param callback - Функция-обработчик
     */
    off(eventType: string, callback: EventCallback): void {
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    /**
     * Отправка события
     * @param eventType - Тип события
     * @param data - Данные события
     */
    emit(eventType: string, data?: any): void {
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            callbacks.forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${eventType}:`, error);
                }
            });
        }
    }

    /**
     * Очистка всех подписок
     */
    clear(): void {
        this.listeners.clear();
    }
}

// Singleton instance
export const eventBus = new EventBus();

