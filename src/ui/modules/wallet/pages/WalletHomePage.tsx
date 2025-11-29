/**
 * Главная страница кошелька
 */

import { WalletBalance } from '../components/WalletBalance';
import { WalletAddress } from '../components/WalletAddress';
import { useWallet } from '../hooks/useWallet';
import './WalletHomePage.css';

type WalletPage = 'home' | 'create' | 'send' | 'receive' | 'history';

interface WalletHomePageProps {
    onNavigate: (page: WalletPage) => void;
}

export function WalletHomePage({ onNavigate }: WalletHomePageProps) {
    const { address, balance, isBalanceLoading, refreshBalance, lockWallet } = useWallet();

    return (
        <div className="wallet-home-page">
            <WalletBalance balance={balance} isLoading={isBalanceLoading} />

            <WalletAddress address={address} />

            <div className="wallet-home-page__actions">
                <button
                    className="wallet-home-page__action-btn wallet-home-page__action-btn--primary"
                    onClick={() => onNavigate('send')}
                >
                    <span className="wallet-home-page__action-icon">📤</span>
                    <span className="wallet-home-page__action-text">Отправить</span>
                </button>
                <button
                    className="wallet-home-page__action-btn wallet-home-page__action-btn--secondary"
                    onClick={() => onNavigate('receive')}
                >
                    <span className="wallet-home-page__action-icon">📥</span>
                    <span className="wallet-home-page__action-text">Получить</span>
                </button>
                <button
                    className="wallet-home-page__action-btn wallet-home-page__action-btn--tertiary"
                    onClick={() => onNavigate('history')}
                >
                    <span className="wallet-home-page__action-icon">📋</span>
                    <span className="wallet-home-page__action-text">История</span>
                </button>
            </div>

            <div className="wallet-home-page__footer">
                <button
                    className="wallet-home-page__refresh-btn"
                    onClick={refreshBalance}
                    disabled={isBalanceLoading}
                >
                    {isBalanceLoading ? 'Обновление...' : '🔄 Обновить баланс'}
                </button>
                <button
                    className="wallet-home-page__logout-btn"
                    onClick={lockWallet}
                    title="Выйти из кошелька"
                >
                    🚪 Выйти
                </button>
            </div>
        </div>
    );
}

