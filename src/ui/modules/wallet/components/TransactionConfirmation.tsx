/**
 * Компонент подтверждения транзакции
 */

import './TransactionConfirmation.css';

interface TransactionConfirmationProps {
    to: string;
    amount: string;
    gasEstimate: string | null;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function TransactionConfirmation({
    to,
    amount,
    gasEstimate,
    onConfirm,
    onCancel,
    isLoading = false,
}: TransactionConfirmationProps) {
    const totalAmount = gasEstimate
        ? (parseFloat(amount) + parseFloat(gasEstimate)).toFixed(6)
        : amount;

    return (
        <div className="transaction-confirmation">
            <div className="transaction-confirmation__overlay" onClick={onCancel} />
            <div className="transaction-confirmation__modal">
                <h3 className="transaction-confirmation__title">Подтверждение транзакции</h3>

                <div className="transaction-confirmation__content">
                    <div className="transaction-confirmation__warning">
                        ⚠️ Проверьте детали транзакции перед подтверждением
                    </div>

                    <div className="transaction-confirmation__detail">
                        <span className="transaction-confirmation__label">Получатель:</span>
                        <span className="transaction-confirmation__value" title={to}>
                            {to.slice(0, 6)}...{to.slice(-4)}
                        </span>
                    </div>

                    <div className="transaction-confirmation__detail">
                        <span className="transaction-confirmation__label">Сумма:</span>
                        <span className="transaction-confirmation__value transaction-confirmation__value--amount">
                            {parseFloat(amount).toFixed(6)} ETH
                        </span>
                    </div>

                    {gasEstimate && (
                        <div className="transaction-confirmation__detail">
                            <span className="transaction-confirmation__label">Комиссия (примерно):</span>
                            <span className="transaction-confirmation__value">
                                {parseFloat(gasEstimate).toFixed(6)} ETH
                            </span>
                        </div>
                    )}

                    <div className="transaction-confirmation__detail transaction-confirmation__detail--total">
                        <span className="transaction-confirmation__label">Всего списано:</span>
                        <span className="transaction-confirmation__value transaction-confirmation__value--total">
                            {totalAmount} ETH
                        </span>
                    </div>
                </div>

                <div className="transaction-confirmation__actions">
                    <button
                        className="transaction-confirmation__cancel-btn"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Отмена
                    </button>
                    <button
                        className="transaction-confirmation__confirm-btn"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Отправка...' : 'Подтвердить'}
                    </button>
                </div>
            </div>
        </div>
    );
}

