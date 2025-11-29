/**
 * Провайдер блокчейна
 * Подключение к Ethereum сети и работа с транзакциями
 */

import { ethers } from 'ethers';
import { CURRENT_NETWORK, SEPOLIA_RPC_FALLBACKS } from '@/config/network';
import type { TransactionResult, GasEstimate } from './types';

/**
 * Провайдер блокчейна с поддержкой fallback RPC endpoints
 */
export class BlockchainProvider {
    private provider: ethers.Provider;
    private network: typeof CURRENT_NETWORK;
    private rpcEndpoints: string[];
    private currentRpcIndex: number = 0;
    private infuraApiKey: string | null = null;

    constructor() {
        this.network = CURRENT_NETWORK;
        this.rpcEndpoints = [this.network.rpcUrl, ...SEPOLIA_RPC_FALLBACKS];

        // Извлекаем Infura API ключ из URL, если это Infura endpoint
        const infuraMatch = this.rpcEndpoints[this.currentRpcIndex]?.match(/infura\.io\/v3\/([^/]+)/);
        if (infuraMatch) {
            this.infuraApiKey = infuraMatch[1];
        }

        // Используем InfuraProvider если это Infura, иначе JsonRpcProvider
        if (this.infuraApiKey && this.network.name === 'Sepolia') {
            this.provider = new ethers.InfuraProvider('sepolia', this.infuraApiKey);
        } else {
            this.provider = new ethers.JsonRpcProvider(this.rpcEndpoints[this.currentRpcIndex], {
                name: 'sepolia',
                chainId: 11155111,
            });
        }
    }

    /**
     * Переключение на следующий RPC endpoint при ошибке
     */
    private switchToNextRpc(): void {
        // Если нет других endpoints, не переключаемся
        if (this.rpcEndpoints.length <= 1) {
            console.warn('No fallback RPC endpoints available. Using current endpoint.');
            return;
        }

        this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcEndpoints.length;
        const nextEndpoint = this.rpcEndpoints[this.currentRpcIndex];

        if (!nextEndpoint) {
            console.error('No valid RPC endpoint available');
            return;
        }

        console.log(`Switching to RPC endpoint: ${nextEndpoint}`);

        // Извлекаем Infura API ключ из URL, если это Infura endpoint
        const infuraMatch = nextEndpoint.match(/infura\.io\/v3\/([^/]+)/);
        if (infuraMatch) {
            this.infuraApiKey = infuraMatch[1];
            this.provider = new ethers.InfuraProvider('sepolia', this.infuraApiKey);
        } else {
            // Для не-Infura endpoints используем JsonRpcProvider только если это не публичный RPC с CORS проблемами
            if (nextEndpoint.includes('rpc.sepolia.org') || nextEndpoint.includes('tenderly')) {
                console.warn('Skipping RPC endpoint due to CORS issues:', nextEndpoint);
                // Пробуем следующий endpoint
                if (this.currentRpcIndex < this.rpcEndpoints.length - 1) {
                    this.switchToNextRpc();
                }
                return;
            }
            this.provider = new ethers.JsonRpcProvider(nextEndpoint, {
                name: 'sepolia',
                chainId: 11155111,
            });
        }
    }

    /**
     * Выполнение запроса с таймаутом и fallback
     */
    private async executeWithTimeout<T>(
        operation: () => Promise<T>,
        timeoutMs: number = 10000,
        retries: number = 2
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
                });

                return await Promise.race([operation(), timeoutPromise]);
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                console.error(`RPC request failed (attempt ${attempt + 1}/${retries + 1}):`, lastError);

                // Переключаемся на следующий RPC endpoint при ошибке
                if (attempt < retries) {
                    this.switchToNextRpc();
                    // Небольшая задержка перед повторной попыткой
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        throw lastError || new Error('All RPC endpoints failed');
    }

    /**
     * Получение баланса адреса
     * @param address - Ethereum адрес
     * @returns Баланс в ETH (строка)
     */
    async getBalance(address: string): Promise<string> {
        return this.executeWithTimeout(async () => {
            const balance = await this.provider.getBalance(address);
            // Конвертируем из Wei в ETH
            return ethers.formatEther(balance);
        }, 10000, 2);
    }

    /**
     * Отправка транзакции
     * @param signedTransaction - Подписанная транзакция (hex строка)
     * @returns Результат транзакции
     */
    async sendTransaction(signedTransaction: string): Promise<TransactionResult> {
        return this.executeWithTimeout(async () => {
            const txResponse = await this.provider.broadcastTransaction(signedTransaction);

            // Ждем подтверждения транзакции с таймаутом
            const receipt = await Promise.race([
                txResponse.wait(),
                new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Transaction confirmation timeout')), 60000);
                }),
            ]);

            if (!receipt) {
                throw new Error('Transaction receipt is null');
            }

            // Получаем полную информацию о транзакции для получения value
            const tx = await this.provider.getTransaction(receipt.hash);
            const block = await receipt.getBlock();

            return {
                hash: receipt.hash,
                from: receipt.from,
                to: receipt.to || '',
                value: tx ? ethers.formatEther(tx.value) : '0',
                gasUsed: receipt.gasUsed,
                gasPrice: receipt.gasPrice || 0n,
                status: receipt.status === 1 ? 'confirmed' : 'failed',
                blockNumber: receipt.blockNumber,
                timestamp: block?.timestamp,
            };
        }, 60000, 1); // 60 секунд для отправки транзакции, без retry
    }

    /**
     * Получение информации о транзакции
     * @param txHash - Хеш транзакции
     * @returns Информация о транзакции
     */
    async getTransaction(txHash: string): Promise<TransactionResult | null> {
        try {
            return await this.executeWithTimeout(async () => {
                const receipt = await this.provider.getTransactionReceipt(txHash);
                if (!receipt) {
                    return null;
                }

                const tx = await this.provider.getTransaction(txHash);
                if (!tx) {
                    return null;
                }

                return {
                    hash: receipt.hash,
                    from: receipt.from,
                    to: receipt.to || '',
                    value: ethers.formatEther(tx.value),
                    gasUsed: receipt.gasUsed,
                    gasPrice: receipt.gasPrice || 0n,
                    status: receipt.status === 1 ? 'confirmed' : 'failed',
                    blockNumber: receipt.blockNumber,
                    timestamp: (await receipt.getBlock())?.timestamp,
                };
            }, 10000, 1);
        } catch (error) {
            console.error('Error getting transaction:', error);
            return null;
        }
    }

    /**
     * Оценка газа для транзакции
     * @param to - Адрес получателя
     * @param value - Сумма в ETH (строка)
     * @returns Оценка газа
     */
    async estimateGas(to: string, value: string): Promise<GasEstimate> {
        return this.executeWithTimeout(async () => {
            const gasPrice = await this.provider.getFeeData();
            const valueInWei = ethers.parseEther(value);

            // Оценка лимита газа
            const gasLimit = await this.provider.estimateGas({
                to,
                value: valueInWei,
            });

            const price = gasPrice.gasPrice || 0n;
            const totalCost = gasLimit * price;

            return {
                gasLimit,
                gasPrice: price,
                maxFeePerGas: gasPrice.maxFeePerGas || undefined,
                maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas || undefined,
                totalCost: ethers.formatEther(totalCost),
            };
        }, 10000, 1);
    }

    /**
     * Получение текущей цены газа
     * @returns Цена газа в Wei
     */
    async getGasPrice(): Promise<bigint> {
        return this.executeWithTimeout(async () => {
            const feeData = await this.provider.getFeeData();
            return feeData.gasPrice || 0n;
        }, 10000, 1);
    }

    /**
     * Получение провайдера ethers
     * @returns Provider (InfuraProvider или JsonRpcProvider)
     */
    getProvider(): ethers.Provider {
        return this.provider;
    }

    /**
     * Получение конфигурации сети
     */
    getNetwork() {
        return this.network;
    }
}

// Singleton instance
export const blockchainProvider = new BlockchainProvider();

