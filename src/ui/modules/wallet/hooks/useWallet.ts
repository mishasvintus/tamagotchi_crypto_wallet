/**
 * Хук для работы с кошельком
 */

import { useState, useEffect, useCallback } from 'react';
import { walletService } from '@/services/wallet-service';
import type { WalletData, CreateWalletResult, ImportWalletResult } from '@/core/wallet/types';
import type { TransactionResult, Transaction } from '@/core/blockchain/types';

interface UseWalletReturn {
    // Состояние
    wallet: WalletData | null;
    address: string | null;
    balance: string | null;
    isLoading: boolean;
    isBalanceLoading: boolean; // Отдельное состояние для загрузки баланса
    error: string | null;
    isWalletCreated: boolean;
    isWalletUnlocked: boolean;

    // Действия
    createWallet: (password: string) => Promise<CreateWalletResult>;
    importWallet: (mnemonic: string, password: string) => Promise<ImportWalletResult>;
    unlockWallet: (password: string) => Promise<boolean>;
    lockWallet: () => void; // Блокировка кошелька (выход)
    deleteWallet: () => void; // Удаление кошелька (необратимо)
    refreshBalance: () => Promise<void>;
    sendTransaction: (to: string, amount: string, password: string) => Promise<TransactionResult>;
    getTransactionHistory: (forceRefresh?: boolean) => Promise<Transaction[]>;
    exportMnemonic: (password: string) => Promise<string>;
    validateAddress: (address: string) => boolean;
    clearError: () => void;
}

/**
 * Хук для работы с кошельком
 */
export function useWallet(): UseWalletReturn {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isBalanceLoading, setIsBalanceLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isWalletCreated, setIsWalletCreated] = useState(false);
    const [isWalletUnlocked, setIsWalletUnlocked] = useState(false);

    // Функция проверки состояния кошелька
    const checkWalletState = useCallback(() => {
        const hasWallet = walletService.isWalletCreated();
        setIsWalletCreated(hasWallet);
        const isUnlocked = walletService.isWalletUnlocked();
        setIsWalletUnlocked(isUnlocked);

        if (hasWallet) {
            const addr = walletService.getAddress();
            if (addr) {
                setAddress(addr);
            }

            // Если кошелек разблокирован, загружаем данные
            if (isUnlocked) {
                const walletData = walletService.getWallet();
                if (walletData) {
                    setWallet(walletData);
                }
            }
        }
    }, []);

    // Проверка наличия кошелька при монтировании и при изменении
    useEffect(() => {
        checkWalletState();

        // Проверяем состояние периодически (на случай, если оно изменилось в другом месте)
        const interval = setInterval(checkWalletState, 1000);

        return () => clearInterval(interval);
    }, [checkWalletState]);

    // Загрузка баланса
    const loadBalance = useCallback(async () => {
        if (!address || !isWalletUnlocked) {
            setBalance(null);
            return;
        }

        try {
            setIsBalanceLoading(true);
            const bal = await walletService.getBalance();
            setBalance(bal);
            setError(null); // Очищаем ошибку при успешной загрузке
        } catch (err) {
            console.error('Error loading balance:', err);
            // Не устанавливаем общую ошибку, только логируем
            // Оставляем предыдущий баланс, если он был
            if (balance === null) {
                setBalance('0');
            }
        } finally {
            setIsBalanceLoading(false);
        }
    }, [address, isWalletUnlocked]);

    // Загрузка баланса при изменении адреса или разблокировке
    useEffect(() => {
        if (address && isWalletUnlocked) {
            loadBalance();
        } else {
            setBalance(null);
        }
    }, [address, isWalletUnlocked]); // Убрали loadBalance из зависимостей, чтобы избежать циклов

    // Автообновление баланса каждые 30 секунд (если кошелек разблокирован)
    useEffect(() => {
        if (!address || !isWalletUnlocked) return;

        const interval = setInterval(() => {
            loadBalance();
        }, 30000); // 30 секунд

        return () => clearInterval(interval);
    }, [address, isWalletUnlocked]); // Убрали loadBalance из зависимостей

    // Создание кошелька
    const createWallet = useCallback(async (password: string): Promise<CreateWalletResult> => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await walletService.createWallet(password);

            // Обновляем состояние
            setWallet(result.wallet);
            setAddress(result.wallet.address);
            setIsWalletCreated(true);
            setIsWalletUnlocked(true); // После создания кошелек автоматически разблокирован

            // Принудительно проверяем состояние для синхронизации
            setTimeout(() => {
                checkWalletState();
            }, 100);

            return result;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to create wallet';
            setError(errorMsg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Импорт кошелька
    const importWallet = useCallback(async (mnemonic: string, password: string): Promise<ImportWalletResult> => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await walletService.importWallet(mnemonic, password);

            if (result.success && result.wallet) {
                // Обновляем состояние
                setWallet(result.wallet);
                setAddress(result.wallet.address);
                setIsWalletCreated(true);
                setIsWalletUnlocked(true); // После импорта кошелек автоматически разблокирован

                // Принудительно проверяем состояние для синхронизации
                setTimeout(() => {
                    checkWalletState();
                }, 100);
            } else {
                setError(result.error || 'Failed to import wallet');
            }

            return result;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to import wallet';
            setError(errorMsg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Разблокировка кошелька
    const unlockWallet = useCallback(async (password: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            const success = await walletService.unlockWallet(password);

            if (success) {
                const walletData = walletService.getWallet();
                if (walletData) {
                    // Обновляем все состояние синхронно
                    setWallet(walletData);
                    setAddress(walletData.address);
                    setIsWalletUnlocked(true);
                    // Загружаем баланс после разблокировки (не блокируем обновление UI)
                    loadBalance().catch(console.error);
                } else {
                    // Если данные не загрузились, все равно помечаем как разблокированный
                    setIsWalletUnlocked(true);
                }
            } else {
                setError('Неверный пароль');
            }

            return success;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to unlock wallet';
            setError(errorMsg);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [loadBalance]);

    // Обновление баланса
    const refreshBalance = useCallback(async () => {
        await loadBalance();
    }, [loadBalance]);

    // Получение истории транзакций
    const getTransactionHistory = useCallback(async (forceRefresh: boolean = false): Promise<Transaction[]> => {
        try {
            setIsLoading(true);
            setError(null);
            return await walletService.getTransactionHistory(forceRefresh);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to load transaction history';
            setError(errorMsg);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Отправка транзакции
    const sendTransaction = useCallback(async (to: string, amount: string, password: string): Promise<TransactionResult> => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await walletService.sendTransaction(to, amount, password);

            // Обновляем баланс после транзакции
            await loadBalance();

            return result;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to send transaction';
            setError(errorMsg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [loadBalance]);

    // Экспорт мнемоники
    const exportMnemonic = useCallback(async (password: string): Promise<string> => {
        try {
            setIsLoading(true);
            setError(null);
            return await walletService.exportMnemonic(password);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to export mnemonic';
            setError(errorMsg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Валидация адреса
    const validateAddress = useCallback((address: string): boolean => {
        return walletService.validateAddress(address);
    }, []);

    // Блокировка кошелька (выход)
    const lockWallet = useCallback(() => {
        walletService.lockWallet();
        // Очищаем состояние
        setWallet(null);
        setAddress(null);
        setBalance(null);
        setIsWalletUnlocked(false);
        setError(null);
        console.log('Wallet locked');
    }, []);

    // Удаление кошелька
    const deleteWallet = useCallback(() => {
        walletService.deleteWallet();
        // Очищаем все состояние
        setWallet(null);
        setAddress(null);
        setBalance(null);
        setIsWalletUnlocked(false);
        setIsWalletCreated(false); // Важно: помечаем, что кошелек не создан
        setError(null);
        console.log('Wallet deleted');
    }, []);

    // Очистка ошибки
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        wallet,
        address,
        balance,
        isLoading,
        isBalanceLoading, // Отдельное состояние для загрузки баланса
        error,
        isWalletCreated,
        isWalletUnlocked,
        createWallet,
        importWallet,
        unlockWallet,
        lockWallet,
        deleteWallet,
        refreshBalance,
        sendTransaction,
        getTransactionHistory,
        exportMnemonic,
        validateAddress,
        clearError,
    };
}

