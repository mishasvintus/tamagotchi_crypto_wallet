/**
 * Хранение данных кошелька
 * Безопасное сохранение и загрузка зашифрованных данных кошелька
 */

import { encrypt, decrypt } from './encryption';
import type { WalletData, EncryptedWalletData } from '../wallet/types';
import type { SaveWalletResult, LoadWalletResult } from './types';

const STORAGE_KEY = 'wallet_encrypted_data';

/**
 * Хранилище кошелька
 */
export class WalletStorage {
    /**
     * Сохранение кошелька в зашифрованном виде
     * @param walletData - Данные кошелька
     * @param password - Пароль для шифрования
     * @returns Результат сохранения
     */
    async saveWallet(walletData: WalletData, password: string): Promise<SaveWalletResult> {
        try {
            if (!password || password.length < 8) {
                return {
                    success: false,
                    error: 'Password must be at least 8 characters long',
                };
            }

            // Шифруем приватный ключ и мнемонику
            const encryptedPrivateKey = encrypt(walletData.privateKey, password);
            const encryptedMnemonic = encrypt(walletData.mnemonic, password);

            // Сохраняем зашифрованные данные
            const encryptedData: EncryptedWalletData = {
                encryptedPrivateKey,
                encryptedMnemonic,
                address: walletData.address,
                publicKey: walletData.publicKey,
                salt: '', // Можно добавить соль для дополнительной безопасности
            };

            // Сохраняем в localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedData));

            return {
                success: true,
            };
        } catch (error) {
            console.error('Error saving wallet:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Загрузка и расшифровка кошелька
     * @param password - Пароль для расшифровки
     * @returns Результат загрузки с данными кошелька
     */
    async loadWallet(password: string): Promise<LoadWalletResult> {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return {
                    success: false,
                    error: 'No wallet found',
                };
            }

            const encryptedData: EncryptedWalletData = JSON.parse(stored);

            // Расшифровываем данные
            const privateKey = decrypt(encryptedData.encryptedPrivateKey, password);
            const mnemonic = decrypt(encryptedData.encryptedMnemonic, password);

            const walletData: WalletData = {
                address: encryptedData.address,
                privateKey,
                mnemonic,
                publicKey: encryptedData.publicKey,
            };

            return {
                success: true,
                wallet: walletData,
            };
        } catch (error) {
            console.error('Error loading wallet:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to decrypt wallet. Invalid password?',
            };
        }
    }

    /**
     * Проверка наличия сохраненного кошелька
     * @returns true если кошелек сохранен
     */
    hasWallet(): boolean {
        return localStorage.getItem(STORAGE_KEY) !== null;
    }

    /**
     * Удаление сохраненного кошелька
     * ВАЖНО: Это действие необратимо!
     */
    clearWallet(): void {
        localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * Получение адреса без расшифровки (для отображения)
     * @returns Адрес кошелька или null
     */
    getAddress(): string | null {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return null;
            }

            const encryptedData: EncryptedWalletData = JSON.parse(stored);
            return encryptedData.address;
        } catch (error) {
            console.error('Error getting address:', error);
            return null;
        }
    }
}

// Singleton instance
export const walletStorage = new WalletStorage();

