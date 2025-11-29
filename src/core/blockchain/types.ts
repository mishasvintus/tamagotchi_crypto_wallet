/**
 * Типы для работы с блокчейном
 */

/**
 * Результат транзакции
 */
export interface TransactionResult {
    hash: string;
    from: string;
    to: string;
    value: string; // в ETH
    gasUsed: bigint;
    gasPrice: bigint;
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    timestamp?: number;
}

/**
 * Транзакция
 */
export interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string; // в ETH
    gasUsed: bigint;
    gasPrice: bigint;
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    timestamp?: number;
    type: 'sent' | 'received';
}

/**
 * Оценка газа для транзакции
 */
export interface GasEstimate {
    gasLimit: bigint;
    gasPrice: bigint;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    totalCost: string; // в ETH
}

