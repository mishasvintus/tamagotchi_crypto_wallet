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

    // Инициализация страницы на основе состояния кошелька
    useEffect(() => {
        if (isWalletCreated) {
            if (isWalletUnlocked) {
                setCurrentPage('home');
            } else {
                // Кошелек создан, но не разблокирован - показываем страницу входа
                // currentPage остается как есть, логика ниже покажет LoginPage
            }
        } else {
            // Кошелек не создан - показываем страницу создания
            setCurrentPage('create');
        }
    }, [isWalletCreated, isWalletUnlocked]);

    // Автоматически переключаемся на главную страницу после разблокировки
    useEffect(() => {
        if (isWalletUnlocked && isWalletCreated) {
            // Если кошелек разблокирован, показываем главную страницу
            setCurrentPage('home');
        }
    }, [isWalletUnlocked, isWalletCreated]);

    const handleNavigate = (page: WalletPage) => {
        setCurrentPage(page);
    };

    const handleBack = () => {
        setCurrentPage('home');
    };

    const handleLoginSuccess = () => {
        // Состояние уже обновлено в useWallet, useEffect переключит страницу
        // Принудительно переключаем для немедленного обновления
        setCurrentPage('home');
    };

    // Если кошелёк не создан, показываем страницу создания
    if (!isWalletCreated) {
        return (
            <div className="wallet-module">
                <div className="wallet-module__header">
                    <h2>💰 Кошелёк</h2>
                </div>
                <div className="wallet-module__content">
                    <CreateWalletPage />
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

