/**
 * Компонент отображения баланса кошелька
 */

import './WalletBalance.css';

interface WalletBalanceProps {
    balance: string | null;
    isLoading?: boolean;
    currency?: string;
}

export function WalletBalance({ balance, isLoading = false, currency = 'ETH' }: WalletBalanceProps) {
    if (isLoading) {
        return (
            <div className="wallet-balance">
                <div className="wallet-balance__label">Баланс</div>
                <div className="wallet-balance__value wallet-balance__value--loading">Загрузка...</div>
            </div>
        );
    }

    if (balance === null) {
        return (
            <div className="wallet-balance">
                <div className="wallet-balance__label">Баланс</div>
                <div className="wallet-balance__value wallet-balance__value--error">Недоступен</div>
            </div>
        );
    }

    // Форматируем баланс (показываем до 6 знаков после запятой)
    const formattedBalance = parseFloat(balance).toFixed(6);

    return (
        <div className="wallet-balance">
            <div className="wallet-balance__label">Баланс</div>
            <div className="wallet-balance__value">
                {formattedBalance} <span className="wallet-balance__currency">{currency}</span>
            </div>
        </div>
    );
}

