/**
 * Интеграция с Etherscan API для получения истории транзакций
 */

import axios from 'axios';
import { CURRENT_NETWORK } from '@/config/network';
import type { Transaction } from './types';

interface EtherscanResponse {
    status: string;
    message: string;
    result: EtherscanTransaction[];
}

interface EtherscanTransaction {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    isError: string;
    txreceipt_status: string;
}

/**
 * API для работы с Etherscan
 */
export class EtherscanAPI {
    private baseUrl: string;
    private apiKey: string | null;
    private cache: Map<string, { data: Transaction[]; timestamp: number }> = new Map();
    private readonly CACHE_DURATION = 60000; // 1 минута

    constructor() {
        // Используем V2 API (обязательно с 2024 года)
        // V2 API использует единый endpoint для всех сетей с параметром chainid
        this.baseUrl = 'https://api.etherscan.io/v2/api';

        // API ключ ОБЯЗАТЕЛЕН для V2 API
        this.apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || null;

        if (!this.apiKey) {
            console.warn('Etherscan API key not set. V2 API requires API key. Get free API key at https://etherscan.io/apis');
        } else {
            console.log('Etherscan API key loaded:', this.apiKey.substring(0, 8) + '...');
        }
    }

    /**
     * Получение истории транзакций для адреса
     * @param address - Ethereum адрес
     * @param startBlock - Начальный блок (опционально)
     * @param endBlock - Конечный блок (опционально)
     * @param useCache - Использовать кэш (по умолчанию true)
     * @returns Список транзакций
     */
    async getTransactionHistory(
        address: string,
        startBlock: number = 0,
        endBlock: number = 99999999,
        useCache: boolean = true
    ): Promise<Transaction[]> {
        const cacheKey = `${address.toLowerCase()}-${startBlock}-${endBlock}`;

        // Проверяем кэш
        if (useCache) {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
                console.log('Returning cached transactions:', cached.data.length);
                return cached.data;
            }
        }

        try {
            // Валидация адреса
            if (!address || !address.startsWith('0x') || address.length !== 42) {
                throw new Error('Invalid Ethereum address');
            }

            // V2 API требует chainid и использует другой формат параметров
            const chainId = CURRENT_NETWORK.chainId; // 11155111 для Sepolia

            const params: Record<string, string> = {
                chainid: chainId.toString(), // ОБЯЗАТЕЛЬНО для V2 API
                module: 'account',
                action: 'txlist',
                address: address.toLowerCase(), // Приводим к нижнему регистру
                startblock: startBlock.toString(),
                endblock: endBlock.toString(),
                sort: 'desc',
            };

            // API ключ ОБЯЗАТЕЛЕН для V2 API
            if (!this.apiKey) {
                console.warn('Etherscan API key is required for V2 API. History will be empty. Get free API key at https://etherscan.io/apis');
                console.warn('To enable transaction history, add VITE_ETHERSCAN_API_KEY to your .env file');
                return [];
            }

            // Добавляем API ключ в параметры
            params.apikey = this.apiKey;

            console.log('Fetching transactions from Etherscan:', { address, hasApiKey: !!this.apiKey });

            const response = await axios.get<EtherscanResponse>(this.baseUrl, {
                params,
                timeout: 15000, // 15 секунд таймаут
            });

            console.log('Etherscan API response:', {
                status: response.data.status,
                message: response.data.message,
                resultCount: Array.isArray(response.data.result) ? response.data.result.length : 0,
                resultType: typeof response.data.result,
                resultPreview: Array.isArray(response.data.result)
                    ? response.data.result.slice(0, 2)
                    : response.data.result,
            });

            // Проверяем статус ответа
            if (response.data.status === '0') {
                // Если нет транзакций или ошибка
                const message = response.data.message || 'Unknown error';

                // Обрабатываем различные случаи
                if (message === 'No transactions found' ||
                    message.includes('No transactions') ||
                    message === 'OK' && (!response.data.result || response.data.result.length === 0)) {
                    console.log('No transactions found for address:', address);
                    const emptyResult: Transaction[] = [];
                    this.cache.set(cacheKey, { data: emptyResult, timestamp: Date.now() });
                    return emptyResult;
                }

                // Если это ошибка о deprecated V1 endpoint
                if (message.includes('deprecated V1 endpoint') || message.includes('V2')) {
                    console.error('Etherscan API V1 deprecated error. Full response:', JSON.stringify(response.data, null, 2));
                    console.error('API Key present:', !!this.apiKey, 'API Key length:', this.apiKey?.length);
                    console.error('Request params:', params);
                    // Возможно, проблема в формате запроса или API ключ не принимается
                    // Попробуем вернуть пустой массив с предупреждением
                    const emptyResult: Transaction[] = [];
                    return emptyResult;
                }

                // Если это ошибка лимита или "NOTOK", возвращаем пустой массив с предупреждением
                if (message === 'NOTOK' || message.includes('rate limit') || message.includes('Max rate limit')) {
                    console.warn('Etherscan API error:', message);
                    if (typeof response.data.result === 'string') {
                        console.warn('API response details:', response.data.result);
                    }
                    const emptyResult: Transaction[] = [];
                    return emptyResult;
                }

                // Для других ошибок выбрасываем исключение
                console.error('Etherscan API error:', message, response.data);
                throw new Error(`Etherscan API error: ${message}`);
            }

            // Проверяем, что статус '1' (успех)
            if (response.data.status !== '1') {
                console.warn('Unexpected Etherscan API status:', response.data.status, response.data);
            }

            // Проверяем, что result является массивом
            if (!Array.isArray(response.data.result)) {
                console.warn('Etherscan API returned non-array result:', {
                    type: typeof response.data.result,
                    value: response.data.result,
                    fullResponse: response.data,
                });
                return [];
            }

            // Проверяем, что массив не пустой
            if (response.data.result.length === 0) {
                console.log('Etherscan API returned empty array for address:', address);
                const emptyResult: Transaction[] = [];
                this.cache.set(cacheKey, { data: emptyResult, timestamp: Date.now() });
                return emptyResult;
            }

            console.log(`Mapping ${response.data.result.length} transactions for address:`, address);
            const transactions = this.mapEtherscanTransactions(response.data.result, address);
            console.log(`Mapped ${transactions.length} transactions successfully`);

            // Сохраняем в кэш
            this.cache.set(cacheKey, { data: transactions, timestamp: Date.now() });

            return transactions;
        } catch (error) {
            console.error('Error fetching transaction history:', error);

            // Если это ошибка axios, извлекаем более детальную информацию
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || error.message;
                console.error('Axios error details:', {
                    message: errorMessage,
                    status: error.response?.status,
                    data: error.response?.data,
                });

                // Если это ошибка лимита, возвращаем пустой массив вместо исключения
                if (errorMessage === 'NOTOK' || errorMessage?.includes('rate limit')) {
                    console.warn('Etherscan API rate limit. Returning empty array.');
                    return [];
                }

                throw new Error(`Etherscan API request failed: ${errorMessage}`);
            }

            throw error;
        }
    }

    /**
     * Очистка кэша для адреса
     * @param address - Ethereum адрес (опционально, если не указан - очищает весь кэш)
     */
    clearCache(address?: string): void {
        if (address) {
            // Очищаем кэш только для конкретного адреса
            const keysToDelete: string[] = [];
            this.cache.forEach((_, key) => {
                if (key.startsWith(`${address}-`)) {
                    keysToDelete.push(key);
                }
            });
            keysToDelete.forEach(key => this.cache.delete(key));
        } else {
            // Очищаем весь кэш
            this.cache.clear();
        }
    }

    /**
     * Преобразование транзакций Etherscan в формат приложения
     */
    private mapEtherscanTransactions(
        transactions: EtherscanTransaction[],
        walletAddress: string
    ): Transaction[] {
        return transactions.map((tx) => {
            const valueInEth = (parseInt(tx.value) / 1e18).toString();
            const isSent = tx.from.toLowerCase() === walletAddress.toLowerCase();
            const isError = tx.isError === '1' || tx.txreceipt_status === '0';

            return {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: valueInEth,
                gasUsed: BigInt(tx.gasUsed),
                gasPrice: BigInt(tx.gasPrice),
                status: isError ? 'failed' : 'confirmed',
                blockNumber: parseInt(tx.blockNumber),
                timestamp: parseInt(tx.timeStamp),
                type: isSent ? 'sent' : 'received',
            };
        });
    }

    /**
     * Получение URL транзакции в блокчейн-эксплорере
     * @param txHash - Хеш транзакции
     * @returns URL
     */
    getTransactionUrl(txHash: string): string {
        return `${CURRENT_NETWORK.explorerUrl}/tx/${txHash}`;
    }
}

// Singleton instance
export const etherscanAPI = new EtherscanAPI();

