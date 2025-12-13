/**
 * Модуль кошелька
 * Главный компонент для работы с криптокошельком
 */

import { useState, useEffect } from 'react';
import { useWallet } from './hooks/useWallet';
import { CreateWalletPage } from './pages/CreateWalletPage';
import { LoginPage } from './pages/LoginPage';
import { WalletHomePage } from './pages/WalletHomePage';
import { SendPage } from './pages/SendPage';
import { ReceivePage } from './pages/ReceivePage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import './WalletModule.css';

type WalletPage = 'home' | 'create' | 'send' | 'receive' | 'history';

export function WalletModule() {
    const { isWalletCreated, isWalletUnlocked } = useWallet();
    const [currentPage, setCurrentPage] = useState<WalletPage>('create');
    const [isSeedPendingConfirmation, setIsSeedPendingConfirmation] = useState(
        () => localStorage.getItem('wallet_seed_pending_confirmation') === 'true'
    );

    // Слушаем изменения localStorage для обновления состояния
    useEffect(() => {
        const checkSeedConfirmation = () => {
            const pending = localStorage.getItem('wallet_seed_pending_confirmation') === 'true';
            setIsSeedPendingConfirmation(pending);
        };

        const interval = setInterval(checkSeedConfirmation, 100);

        window.addEventListener('storage', checkSeedConfirmation);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', checkSeedConfirmation);
        };
    }, []);

    // Инициализация страницы на основе состояния кошелька
    useEffect(() => {
        if (isWalletCreated) {
            if (isSeedPendingConfirmation) {
                setCurrentPage('create');
                return;
            }
            if (isWalletUnlocked) {
                setCurrentPage('home');
            }
        } else {
            setCurrentPage('create');
        }
    }, [isWalletCreated, isWalletUnlocked, isSeedPendingConfirmation]);

    // Автоматически переключаемся на главную страницу после разблокировки
    useEffect(() => {
        if (isSeedPendingConfirmation) {
            return;
        }
        if (isWalletUnlocked && isWalletCreated) {
            setCurrentPage('home');
        }
    }, [isWalletUnlocked, isWalletCreated, isSeedPendingConfirmation]);

    const handleNavigate = (page: WalletPage) => {
        setCurrentPage(page);
    };

    const handleBack = () => {
        setCurrentPage('home');
    };

    const handleLoginSuccess = () => {
        setCurrentPage('home');
    };

    // Если кошелёк не создан или seed фраза еще не подтверждена, показываем страницу создания
    if (!isWalletCreated || isSeedPendingConfirmation) {
        return (
            <div className="wallet-module">
                <div className="wallet-module__header">
                    <h2>💰 Кошелёк</h2>
                </div>
                <div className="wallet-module__content">
                    <CreateWalletPage onSeedConfirmed={() => setIsSeedPendingConfirmation(false)} />
                </div>
            </div>
        );
    }

    // Если кошелёк создан, но не разблокирован, показываем страницу входа
    if (!isWalletUnlocked) {
        return (
            <div className="wallet-module">
                <div className="wallet-module__header">
                    <h2>💰 Кошелёк</h2>
                </div>
                <div className="wallet-module__content">
                    <LoginPage
                        onSuccess={handleLoginSuccess}
                        onSwitchWallet={() => setCurrentPage('create')}
                    />
                </div>
            </div>
        );
    }

    // Показываем соответствующую страницу
    return (
        <div className="wallet-module">
            <div className="wallet-module__header">
                <h2>💰 Кошелёк</h2>
            </div>
            <div className="wallet-module__content">
                {currentPage === 'home' && (
                    <WalletHomePage onNavigate={handleNavigate} />
                )}
                {currentPage === 'send' && (
                    <SendPage onBack={handleBack} />
                )}
                {currentPage === 'receive' && (
                    <ReceivePage onBack={handleBack} />
                )}
                {currentPage === 'history' && (
                    <TransactionHistoryPage onBack={handleBack} />
                )}
            </div>
        </div>
    );
}

