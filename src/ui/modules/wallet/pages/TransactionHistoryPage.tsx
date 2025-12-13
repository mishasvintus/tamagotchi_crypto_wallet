/**
 * Страница истории транзакций
 */

import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { TransactionItem } from '../components/TransactionItem';
import type { Transaction } from '@/core/blockchain/types';
import './TransactionHistoryPage.css';

interface TransactionHistoryPageProps {
    onBack: () => void;
}

type FilterType = 'all' | 'sent' | 'received';

export function TransactionHistoryPage({ onBack }: TransactionHistoryPageProps) {
    const { address, getTransactionHistory } = useWallet();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [filter, setFilter] = useState<FilterType>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTransactions();
    }, [address]); // Перезагружаем при изменении адреса

    // Слушаем события о новых транзакциях для автоматического обновления
    useEffect(() => {
        const handleTransactionSent = () => {
            // Небольшая задержка, чтобы Etherscan успел проиндексировать транзакцию
            setTimeout(() => {
                loadTransactions();
            }, 3000); // 3 секунды задержка
        };

        // Подписываемся на события транзакций через window (EventBus может быть недоступен напрямую)
        window.addEventListener('wallet-transaction-sent', handleTransactionSent);
        window.addEventListener('wallet-transaction-received', handleTransactionSent);

        return () => {
            window.removeEventListener('wallet-transaction-sent', handleTransactionSent);
            window.removeEventListener('wallet-transaction-received', handleTransactionSent);
        };
    }, []);

    useEffect(() => {
        filterTransactions();
    }, [filter, transactions]);

    const loadTransactions = async (forceRefresh: boolean = false) => {
        if (!address) return;

        try {
            setIsLoading(true);
            setError(null);
            console.log('Loading transactions, forceRefresh:', forceRefresh);
            const history = await getTransactionHistory(forceRefresh);
            console.log('Loaded transactions:', history.length);
            setTransactions(history);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не удалось загрузить историю транзакций');
            console.error('Error loading transactions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filterTransactions = () => {
        if (filter === 'all') {
            setFilteredTransactions(transactions);
        } else {
            setFilteredTransactions(
                transactions.filter((tx) => tx.type === filter)
            );
        }
    };

    if (!address) {
        return (
            <div className="transaction-history-page">
                <div className="transaction-history-page__error">
                    Адрес кошелька не найден
                </div>
                <button className="transaction-history-page__back-btn" onClick={onBack}>
                    Назад
                </button>
            </div>
        );
    }

    return (
        <div className="transaction-history-page">
            <div className="transaction-history-page__header">
                <h2 className="transaction-history-page__title">История транзакций</h2>
                <button
                    className="transaction-history-page__refresh-btn"
                    onClick={() => loadTransactions(true)}
                    disabled={isLoading}
                >
                    {isLoading ? '🔄' : '🔄 Обновить'}
                </button>
            </div>

            <div className="transaction-history-page__filters">
                <button
                    className={`transaction-history-page__filter-btn ${filter === 'all' ? 'transaction-history-page__filter-btn--active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Все ({transactions.length})
                </button>
                <button
                    className={`transaction-history-page__filter-btn ${filter === 'sent' ? 'transaction-history-page__filter-btn--active' : ''}`}
                    onClick={() => setFilter('sent')}
                >
                    Отправленные ({transactions.filter(tx => tx.type === 'sent').length})
                </button>
                <button
                    className={`transaction-history-page__filter-btn ${filter === 'received' ? 'transaction-history-page__filter-btn--active' : ''}`}
                    onClick={() => setFilter('received')}
                >
                    Полученные ({transactions.filter(tx => tx.type === 'received').length})
                </button>
            </div>

            {isLoading && transactions.length === 0 && (
                <div className="transaction-history-page__loading">
                    Загрузка транзакций...
                </div>
            )}

            {error && (
                <div className="transaction-history-page__error">
                    {error}
                    {error.includes('API key') && (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '8px', fontSize: '0.9rem' }}>
                            <strong>Как получить API ключ:</strong>
                            <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                                <li>Зарегистрируйтесь на <a href="https://etherscan.io/register" target="_blank" rel="noopener noreferrer">etherscan.io</a></li>
                                <li>Перейдите в <a href="https://etherscan.io/myapikey" target="_blank" rel="noopener noreferrer">My API Keys</a></li>
                                <li>Создайте новый API ключ</li>
                                <li>Добавьте его в файл <code>.env</code>: <code>VITE_ETHERSCAN_API_KEY=your_key</code></li>
                                <li>Перезапустите dev-сервер</li>
                            </ol>
                        </div>
                    )}
                </div>
            )}

            {!isLoading && filteredTransactions.length === 0 && !error && (
                <div className="transaction-history-page__empty">
                    <div className="transaction-history-page__empty-icon">📭</div>
                    <div className="transaction-history-page__empty-text">
                        Транзакций пока нет
                    </div>
                </div>
            )}

            {filteredTransactions.length > 0 && (
                <div className="transaction-history-page__list">
                    {filteredTransactions.map((tx) => (
                        <TransactionItem
                            key={tx.hash}
                            transaction={tx}
                            walletAddress={address}
                        />
                    ))}
                </div>
            )}

            <button className="transaction-history-page__back-btn" onClick={onBack}>
                Назад
            </button>
        </div>
    );
}

