/**
 * Сервис кошелька
 * Интерфейс между UI и core слоями
 */

import { ethers } from 'ethers';
import { walletGenerator } from '@/core/wallet/wallet-generator';
import { walletStorage } from '@/core/storage/wallet-storage';
import { blockchainProvider } from '@/core/blockchain/provider';
import { etherscanAPI } from '@/core/blockchain/etherscan-api';
import { eventBus } from './event-bus';
import type { WalletData, CreateWalletResult, ImportWalletResult } from '@/core/wallet/types';
import type { TransactionResult, Transaction } from '@/core/blockchain/types';

/**
 * Интерфейс сервиса кошелька
 */
export interface IWalletService {
    // Управление кошельком
    createWallet(password: string): Promise<CreateWalletResult>;
    importWallet(mnemonic: string, password: string): Promise<ImportWalletResult>;
    unlockWallet(password: string): Promise<boolean>;
    lockWallet(): void; // Блокировка кошелька (выход)
    deleteWallet(): void; // Удаление кошелька (необратимо)
    isWalletUnlocked(): boolean;
    getWallet(): WalletData | null;
    isWalletCreated(): boolean;

    // Работа с блокчейном
    getBalance(): Promise<string>; // в ETH
    sendTransaction(to: string, amount: string, password: string): Promise<TransactionResult>;
    getTransactionHistory(): Promise<Transaction[]>;

    // Утилиты
    getAddress(): string | null;
    exportMnemonic(password: string): Promise<string>;
    validateAddress(address: string): boolean;
    refreshBalance(): Promise<string>;
}

/**
 * Реализация сервиса кошелька
 */
export class WalletService implements IWalletService {
    private cachedWallet: WalletData | null = null;

    /**
     * Создание нового кошелька
     */
    async createWallet(password: string): Promise<CreateWalletResult> {
        try {
            // Проверка пароля
            if (!password || password.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }

            // Генерируем новый кошелек
            const result = walletGenerator.generateNewWallet(128); // 12 слов

            // Сохраняем зашифрованным
            const saveResult = await walletStorage.saveWallet(result.wallet, password);
            if (!saveResult.success) {
                throw new Error(saveResult.error || 'Failed to save wallet');
            }

            // Кэшируем кошелек (безопасно, так как он только что создан)
            this.cachedWallet = result.wallet;

            // Отправляем событие о создании кошелька
            eventBus.emit('wallet:created', {
                address: result.wallet.address,
            });

            return result;
        } catch (error) {
            console.error('Error creating wallet:', error);
            throw error;
        }
    }

    /**
     * Импорт кошелька из мнемонической фразы
     */
    async importWallet(mnemonic: string, password: string): Promise<ImportWalletResult> {
        try {
            // Проверка пароля
            if (!password || password.length < 8) {
                return {
                    wallet: {} as WalletData,
                    success: false,
                    error: 'Password must be at least 8 characters long',
                };
            }

            // Импортируем кошелек
            const result = walletGenerator.importWalletFromMnemonic(mnemonic);
            if (!result.success) {
                return result;
            }

            // Сохраняем зашифрованным
            const saveResult = await walletStorage.saveWallet(result.wallet, password);
            if (!saveResult.success) {
                return {
                    wallet: {} as WalletData,
                    success: false,
                    error: saveResult.error || 'Failed to save wallet',
                };
            }

            // Кэшируем кошелек
            this.cachedWallet = result.wallet;

            // Отправляем событие о создании кошелька (импорт = создание)
            eventBus.emit('wallet:created', {
                address: result.wallet.address,
            });

            return result;
        } catch (error) {
            console.error('Error importing wallet:', error);
            return {
                wallet: {} as WalletData,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Разблокировка кошелька паролем
     * @param password - Пароль для расшифровки
     * @returns true если пароль верный и кошелек разблокирован
     */
    async unlockWallet(password: string): Promise<boolean> {
        try {
            const result = await walletStorage.loadWallet(password);
            if (result.success && result.wallet) {
                this.cachedWallet = result.wallet;

                // Отправляем событие о разблокировке
                eventBus.emit('wallet:unlocked', {
                    address: result.wallet.address,
                });

                return true;
            }
            return false;
        } catch (error) {
            console.error('Error unlocking wallet:', error);
            return false;
        }
    }

    /**
     * Блокировка кошелька (выход)
     * Очищает кэш кошелька из памяти, но оставляет зашифрованные данные в хранилище
     */
    lockWallet(): void {
        this.cachedWallet = null;
        console.log('Wallet locked');
    }

    /**
     * Удаление кошелька
     * ВАЖНО: Это действие необратимо! Удаляет все данные кошелька из хранилища
     */
    deleteWallet(): void {
        this.cachedWallet = null;
        walletStorage.clearWallet();
        console.log('Wallet deleted');
    }

    /**
     * Проверка, разблокирован ли кошелек
     */
    isWalletUnlocked(): boolean {
        return this.cachedWallet !== null;
    }

    /**
     * Получение кошелька (из кэша или хранилища)
     * ВАЖНО: Возвращает кошелек только если он уже загружен в память
     */
    getWallet(): WalletData | null {
        return this.cachedWallet;
    }

    /**
     * Проверка наличия кошелька
     */
    isWalletCreated(): boolean {
        return walletStorage.hasWallet();
    }

    /**
     * Получение баланса
     */
    private previousBalance: string | null = null;

    async getBalance(): Promise<string> {
        try {
            const address = this.getAddress();
            if (!address) {
                throw new Error('Wallet not found');
            }

            const previousBalance = this.previousBalance;
            const balance = await blockchainProvider.getBalance(address);

            // Сохраняем текущий баланс как предыдущий для следующего запроса
            this.previousBalance = balance;

            // Отправляем событие об изменении баланса только если баланс изменился
            if (previousBalance !== null && previousBalance !== balance) {
                eventBus.emit('wallet:balance-changed', {
                    address,
                    balance,
                    previousBalance,
                });
            }

            return balance;
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }

    /**
     * Обновление баланса (алиас для getBalance)
     */
    async refreshBalance(): Promise<string> {
        return this.getBalance();
    }

    /**
     * Отправка транзакции
     */
    async sendTransaction(to: string, amount: string, password: string): Promise<TransactionResult> {
        try {
            // Валидация адреса
            if (!this.validateAddress(to)) {
                throw new Error('Invalid recipient address');
            }

            // Загружаем кошелек
            const walletData = await this.loadWalletForTransaction(password);
            if (!walletData) {
                throw new Error('Failed to load wallet. Invalid password?');
            }

            // Создаем кошелек ethers для подписания
            const wallet = new ethers.Wallet(walletData.privateKey, blockchainProvider.getProvider());

            // Получаем конфигурацию сети
            const network = blockchainProvider.getNetwork();

            // Получаем текущий nonce для адреса (критически важно!)
            const provider = blockchainProvider.getProvider();
            const nonce = await provider.getTransactionCount(walletData.address, 'pending');

            // Конвертируем сумму в Wei
            const valueInWei = ethers.parseEther(amount);

            // Оцениваем газ для транзакции
            const gasEstimate = await blockchainProvider.estimateGas(to, amount);

            // Создаем транзакцию с указанием chainId, nonce и gasLimit (требуется для EIP-2718)
            const tx = {
                to,
                value: valueInWei,
                chainId: network.chainId, // Обязательно для EIP-2718 транзакций
                nonce: nonce, // Текущий nonce - критически важно!
                gasLimit: gasEstimate.gasLimit, // Лимит газа
                gasPrice: gasEstimate.gasPrice, // Цена газа
            };

            console.log('Creating transaction:', {
                from: walletData.address,
                to,
                value: amount,
                nonce,
                chainId: network.chainId,
            });

            // Подписываем и отправляем транзакцию
            const signedTx = await wallet.signTransaction(tx);
            const result = await blockchainProvider.sendTransaction(signedTx);

            // Получаем адрес кошелька
            const walletAddress = this.getAddress();

            // Очищаем кэш истории транзакций для обновления после отправки
            if (walletAddress) {
                etherscanAPI.clearCache(walletAddress);
            }

            // Отправляем событие о транзакции
            eventBus.emit('wallet:transaction-sent', {
                hash: result.hash,
                from: result.from,
                to: result.to,
                value: result.value,
                type: 'sent',
            });

            // Также отправляем событие в window для UI компонентов
            window.dispatchEvent(new CustomEvent('wallet-transaction-sent', {
                detail: {
                    hash: result.hash,
                    from: result.from,
                    to: result.to,
                    value: result.value,
                }
            }));

            // Проверяем, является ли получатель нашим кошельком (для события получения)
            if (walletAddress && result.to.toLowerCase() === walletAddress.toLowerCase()) {
                eventBus.emit('wallet:transaction-received', {
                    hash: result.hash,
                    from: result.from,
                    to: result.to,
                    value: result.value,
                    type: 'received',
                });
            }

            return result;
        } catch (error) {
            console.error('Error sending transaction:', error);
            throw error;
        }
    }

    /**
     * Получение истории транзакций
     * @param forceRefresh - Принудительное обновление без кэша
     */
    async getTransactionHistory(forceRefresh: boolean = false): Promise<Transaction[]> {
        try {
            const address = this.getAddress();
            if (!address) {
                throw new Error('Wallet not found');
            }

            console.log('Loading transaction history for address:', address, 'forceRefresh:', forceRefresh);

            // Если принудительное обновление, очищаем кэш
            if (forceRefresh) {
                etherscanAPI.clearCache(address);
            }

            const history = await etherscanAPI.getTransactionHistory(address, 0, 99999999, !forceRefresh);
            console.log('Transaction history loaded:', history.length, 'transactions');

            if (history.length > 0) {
                console.log('Sample transaction:', history[0]);
            }

            return history;
        } catch (error) {
            console.error('Error getting transaction history:', error);
            // Возвращаем пустой массив при ошибке, чтобы не блокировать UI
            return [];
        }
    }

    /**
     * Получение адреса кошелька
     */
    getAddress(): string | null {
        return walletStorage.getAddress();
    }

    /**
     * Экспорт мнемонической фразы
     */
    async exportMnemonic(password: string): Promise<string> {
        try {
            const walletData = await this.loadWalletForTransaction(password);
            if (!walletData) {
                throw new Error('Failed to load wallet. Invalid password?');
            }

            return walletData.mnemonic;
        } catch (error) {
            console.error('Error exporting mnemonic:', error);
            throw error;
        }
    }

    /**
     * Валидация Ethereum адреса
     */
    validateAddress(address: string): boolean {
        // Базовая валидация формата Ethereum адреса
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    /**
     * Загрузка кошелька для транзакции (приватный метод)
     */
    private async loadWalletForTransaction(password: string): Promise<WalletData | null> {
        // Если кошелек уже в кэше, используем его
        if (this.cachedWallet) {
            return this.cachedWallet;
        }

        // Иначе загружаем из хранилища
        const result = await walletStorage.loadWallet(password);
        if (result.success && result.wallet) {
            this.cachedWallet = result.wallet;
            return result.wallet;
        }

        return null;
    }

    /**
     * Очистка кэша (для безопасности)
     */
    clearCache(): void {
        this.cachedWallet = null;
    }
}

// Singleton instance
export const walletService = new WalletService();

