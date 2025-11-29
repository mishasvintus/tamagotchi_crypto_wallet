/**
 * Компонент отображения одной транзакции
 */

import { CURRENT_NETWORK } from '@/config/network';
import type { Transaction } from '@/core/blockchain/types';
import './TransactionItem.css';

interface TransactionItemProps {
    transaction: Transaction;
    walletAddress: string; // Используется для определения типа транзакции (уже есть в transaction.type, но оставляем для совместимости)
}

export function TransactionItem({ transaction }: TransactionItemProps) {
    const isSent = transaction.type === 'sent';
    const explorerUrl = `${CURRENT_NETWORK.explorerUrl}/tx/${transaction.hash}`;
    const date = transaction.timestamp
        ? new Date(transaction.timestamp * 1000).toLocaleString('ru-RU')
        : 'Неизвестно';

    const formatValue = (value: string) => {
        const num = parseFloat(value);
        if (num === 0) return '0';
        if (num < 0.000001) return '< 0.000001';
        return num.toFixed(6);
    };

    return (
        <div className={`transaction-item ${transaction.status === 'failed' ? 'transaction-item--failed' : ''}`}>
            <div className="transaction-item__header">
                <div className="transaction-item__type">
                    <span className={`transaction-item__icon ${isSent ? 'transaction-item__icon--sent' : 'transaction-item__icon--received'}`}>
                        {isSent ? '📤' : '📥'}
                    </span>
                    <span className="transaction-item__type-text">
                        {isSent ? 'Отправлено' : 'Получено'}
                    </span>
                </div>
                <div className={`transaction-item__status transaction-item__status--${transaction.status}`}>
                    {transaction.status === 'pending' && '⏳ Ожидание'}
                    {transaction.status === 'confirmed' && '✓ Подтверждено'}
                    {transaction.status === 'failed' && '✗ Ошибка'}
                </div>
            </div>

            <div className="transaction-item__body">
                <div className="transaction-item__value">
                    <span className={isSent ? 'transaction-item__value--sent' : 'transaction-item__value--received'}>
                        {isSent ? '-' : '+'}{formatValue(transaction.value)} ETH
                    </span>
                </div>

                <div className="transaction-item__details">
                    <div className="transaction-item__detail">
                        <span className="transaction-item__detail-label">Кому:</span>
                        <span className="transaction-item__detail-value" title={isSent ? transaction.to : transaction.from}>
                            {isSent
                                ? `${transaction.to.slice(0, 6)}...${transaction.to.slice(-4)}`
                                : `${transaction.from.slice(0, 6)}...${transaction.from.slice(-4)}`
                            }
                        </span>
                    </div>

                    {transaction.blockNumber && (
                        <div className="transaction-item__detail">
                            <span className="transaction-item__detail-label">Блок:</span>
                            <span className="transaction-item__detail-value">{transaction.blockNumber}</span>
                        </div>
                    )}

                    <div className="transaction-item__detail">
                        <span className="transaction-item__detail-label">Дата:</span>
                        <span className="transaction-item__detail-value">{date}</span>
                    </div>
                </div>

                <div className="transaction-item__hash">
                    <span className="transaction-item__hash-label">Hash:</span>
                    <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transaction-item__hash-link"
                        title={transaction.hash}
                    >
                        {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
                    </a>
                </div>
            </div>
        </div>
    );
}

