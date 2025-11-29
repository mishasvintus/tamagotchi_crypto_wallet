/**
 * Типы для хранения данных
 */

/**
 * Результат сохранения кошелька
 */
export interface SaveWalletResult {
    success: boolean;
    error?: string;
}

/**
 * Результат загрузки кошелька
 */
export interface LoadWalletResult {
    success: boolean;
    wallet?: any; // WalletData после расшифровки
    error?: string;
}

