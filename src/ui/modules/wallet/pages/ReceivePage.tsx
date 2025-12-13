/**
 * Страница получения средств
 */

import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { WalletAddress } from '../components/WalletAddress';
import { useWallet } from '../hooks/useWallet';
import { CURRENT_NETWORK } from '@/config/network';
import './ReceivePage.css';

interface ReceivePageProps {
    onBack: () => void;
}

export function ReceivePage({ onBack }: ReceivePageProps) {
    const { address } = useWallet();

    return (
        <div className="receive-page">
            <div className="receive-page__header">
                <h2 className="receive-page__title">Получить ETH</h2>
            </div>

            {address ? (
                <>
                    <div className="receive-page__qr">
                        <QRCodeDisplay
                            data={address}
                            size={180}
                        />
                    </div>

                    <div className="receive-page__address">
                        <WalletAddress address={address} showFull={true} />
                    </div>

                    {CURRENT_NETWORK.faucetUrl && address && (
                        <div className="receive-page__faucet">
                            <div className="receive-page__faucet-title">
                                Нужны тестовые ETH?
                            </div>
                            <div className="receive-page__faucet-hint">
                                Скопируйте адрес выше и вставьте его на странице faucet
                            </div>
                            <a
                                href={`${CURRENT_NETWORK.faucetUrl}${address ? `?address=${encodeURIComponent(address)}` : ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="receive-page__faucet-link"
                            >
                                Получить тестовые ETH из Google Cloud Faucet →
                            </a>
                        </div>
                    )}

                    <button
                        className="receive-page__back-btn"
                        onClick={onBack}
                    >
                        Назад
                    </button>
                </>
            ) : (
                <>
                    <div className="receive-page__error">
                        Адрес кошелька не найден
                    </div>
                    <button
                        className="receive-page__back-btn"
                        onClick={onBack}
                    >
                        Назад
                    </button>
                </>
            )}
        </div>
    );
}

