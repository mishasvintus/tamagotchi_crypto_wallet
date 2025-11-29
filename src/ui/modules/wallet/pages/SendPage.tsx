/**
 * Страница отправки транзакции
 */

import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { blockchainProvider } from '@/core/blockchain/provider';
import { CURRENT_NETWORK } from '@/config/network';
import { TransactionConfirmation } from '../components/TransactionConfirmation';
import { ErrorDisplay } from '../components/ErrorDisplay';
import './SendPage.css';

interface SendPageProps {
    onBack: () => void;
}

export function SendPage({ onBack }: SendPageProps) {
    const { balance, sendTransaction, validateAddress, error, clearError } = useWallet();
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [password, setPassword] = useState('');
    const [gasEstimate, setGasEstimate] = useState<string | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [addressError, setAddressError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleAddressChange = (value: string) => {
        setToAddress(value);
        setAddressError(null);
        clearError();
    };

    const handleAmountChange = (value: string) => {
        // Разрешаем только числа и точку
        if (/^\d*\.?\d*$/.test(value) || value === '') {
            setAmount(value);
        }
    };

    const handleEstimateGas = async () => {
        if (!toAddress || !amount) {
            return;
        }

        if (!validateAddress(toAddress)) {
            setAddressError('Неверный формат адреса');
            return;
        }

        try {
            setIsEstimating(true);
            setAddressError(null);
            const estimate = await blockchainProvider.estimateGas(toAddress, amount);
            setGasEstimate(estimate.totalCost);
        } catch (err) {
            console.error('Error estimating gas:', err);
            setGasEstimate(null);
        } finally {
            setIsEstimating(false);
        }
    };

    const validateForm = (): boolean => {
        if (!toAddress || !amount || !password) {
            alert('Заполните все поля');
            return false;
        }

        if (!validateAddress(toAddress)) {
            setAddressError('Неверный формат адреса');
            return false;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            alert('Введите корректную сумму');
            return false;
        }

        if (balance && amountNum > parseFloat(balance)) {
            alert('Недостаточно средств');
            return false;
        }

        return true;
    };

    const handleSendClick = () => {
        if (validateForm()) {
            setShowConfirmation(true);
        }
    };

    const handleConfirmSend = async () => {
        if (!validateForm()) {
            setShowConfirmation(false);
            return;
        }

        try {
            setIsSending(true);
            setShowConfirmation(false);
            clearError();
            setAddressError(null);
            const result = await sendTransaction(toAddress, amount, password);
            setTxHash(result.hash);
            setPassword(''); // Очищаем пароль после успешной отправки
        } catch (err) {
            console.error('Error sending transaction:', err);
        } finally {
            setIsSending(false);
        }
    };

    const explorerUrl = `${CURRENT_NETWORK.explorerUrl}/tx/${txHash}`;

    if (txHash) {
        return (
            <div className="send-page">
                <h2 className="send-page__title">Транзакция отправлена!</h2>
                <div className="send-page__success">
                    <div className="send-page__success-icon">✓</div>
                    <div className="send-page__success-message">
                        Транзакция успешно отправлена в сеть
                    </div>
                    <div className="send-page__tx-hash">
                        Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </div>
                    <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="send-page__explorer-link"
                    >
                        Открыть в блокчейн-эксплорере →
                    </a>
                    <button
                        className="send-page__back-btn"
                        onClick={() => {
                            setTxHash(null);
                            setToAddress('');
                            setAmount('');
                            onBack();
                        }}
                    >
                        Вернуться
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="send-page">
            <h2 className="send-page__title">Отправить ETH</h2>

            <div className="send-page__form-group">
                <label className="send-page__label">
                    Адрес получателя
                </label>
                <input
                    type="text"
                    className={`send-page__input ${addressError ? 'send-page__input--error' : ''}`}
                    value={toAddress}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder="0x..."
                />
                {addressError && (
                    <div className="send-page__error-text">{addressError}</div>
                )}
            </div>

            <div className="send-page__form-group">
                <label className="send-page__label">
                    Сумма (ETH)
                </label>
                <input
                    type="text"
                    className="send-page__input"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.0"
                />
                {balance && (
                    <div className="send-page__balance-hint">
                        Доступно: {parseFloat(balance).toFixed(6)} ETH
                    </div>
                )}
            </div>

            {gasEstimate && (
                <div className="send-page__gas-estimate">
                    Примерная комиссия: ~{parseFloat(gasEstimate).toFixed(6)} ETH
                </div>
            )}

            <button
                className="send-page__estimate-btn"
                onClick={handleEstimateGas}
                disabled={!toAddress || !amount || isEstimating}
            >
                {isEstimating ? 'Расчёт...' : 'Оценить комиссию'}
            </button>

            <div className="send-page__form-group">
                <label className="send-page__label">
                    Пароль для подтверждения
                </label>
                <input
                    type="password"
                    className="send-page__input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                />
            </div>

            <ErrorDisplay
                error={error}
                onDismiss={clearError}
                type="error"
            />

            <div className="send-page__actions">
                <button
                    className="send-page__cancel-btn"
                    onClick={onBack}
                    disabled={isSending}
                >
                    Отмена
                </button>
                <button
                    className="send-page__send-btn"
                    onClick={handleSendClick}
                    disabled={!toAddress || !amount || !password || isSending}
                >
                    {isSending ? 'Отправка...' : 'Отправить'}
                </button>
            </div>

            {showConfirmation && (
                <TransactionConfirmation
                    to={toAddress}
                    amount={amount}
                    gasEstimate={gasEstimate}
                    onConfirm={handleConfirmSend}
                    onCancel={() => setShowConfirmation(false)}
                    isLoading={isSending}
                />
            )}
        </div>
    );
}

