/**
 * Генератор кошелька
 * Генерация seed-фразы и создание Ethereum кошелька
 */

import { ethers } from 'ethers';
import { generateMnemonic, validateMnemonic } from '@scure/bip39';
// @ts-ignore - wordlist не экспортируется через основной модуль
import { wordlist } from '@scure/bip39/wordlists/english.js';
import type { WalletData, CreateWalletResult, ImportWalletResult } from './types';

/**
 * Генератор кошелька
 */
export class WalletGenerator {
    /**
     * Генерация мнемонической фразы (seed-фраза)
     * @param strength - Сила энтропии: 128 для 12 слов, 256 для 24 слов
     * @returns Мнемоническая фраза (12 или 24 слова)
     */
    generateMnemonic(strength: 128 | 256 = 128): string {
        return generateMnemonic(wordlist, strength);
    }

    /**
     * Валидация мнемонической фразы
     * @param mnemonic - Мнемоническая фраза для проверки
     * @returns true если фраза валидна
     */
    validateMnemonic(mnemonic: string): boolean {
        return validateMnemonic(mnemonic, wordlist);
    }

    /**
     * Создание кошелька из мнемонической фразы
     * @param mnemonic - Мнемоническая фраза
     * @param index - Индекс деривации (по умолчанию 0)
     * @returns Данные кошелька
     */
    createWalletFromMnemonic(mnemonic: string, index: number = 0): WalletData {
        if (!this.validateMnemonic(mnemonic)) {
            throw new Error('Invalid mnemonic phrase');
        }

        // Создаем HD кошелек из мнемоники
        const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);

        // Деривируем кошелек по индексу (m/44'/60'/0'/0/index)
        const wallet = hdNode.deriveChild(index);

        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: mnemonic,
            publicKey: wallet.publicKey,
        };
    }

    /**
     * Генерация нового кошелька
     * @param strength - Сила энтропии: 128 для 12 слов, 256 для 24 слов
     * @returns Результат создания кошелька с мнемоникой
     */
    generateNewWallet(strength: 128 | 256 = 128): CreateWalletResult {
        const mnemonic = this.generateMnemonic(strength);
        const wallet = this.createWalletFromMnemonic(mnemonic);

        return {
            wallet,
            mnemonic,
        };
    }

    /**
     * Импорт кошелька из мнемонической фразы
     * @param mnemonic - Мнемоническая фраза
     * @param index - Индекс деривации (по умолчанию 0)
     * @returns Результат импорта
     */
    importWalletFromMnemonic(mnemonic: string, index: number = 0): ImportWalletResult {
        try {
            if (!this.validateMnemonic(mnemonic)) {
                return {
                    wallet: {} as WalletData,
                    success: false,
                    error: 'Invalid mnemonic phrase',
                };
            }

            const wallet = this.createWalletFromMnemonic(mnemonic, index);

            return {
                wallet,
                success: true,
            };
        } catch (error) {
            return {
                wallet: {} as WalletData,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Деривация адреса из мнемоники по индексу
     * @param mnemonic - Мнемоническая фраза
     * @param index - Индекс деривации
     * @returns Ethereum адрес
     */
    deriveAddress(mnemonic: string, index: number = 0): string {
        const wallet = this.createWalletFromMnemonic(mnemonic, index);
        return wallet.address;
    }
}

// Singleton instance
export const walletGenerator = new WalletGenerator();

