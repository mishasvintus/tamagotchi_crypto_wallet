/**
 * Компонент отображения адреса кошелька с копированием
 */

import { useState } from 'react';
import './WalletAddress.css';

interface WalletAddressProps {
    address: string | null;
    showFull?: boolean;
}

export function WalletAddress({ address, showFull = false }: WalletAddressProps) {
    const [copied, setCopied] = useState(false);

    if (!address) {
        return (
            <div className="wallet-address">
                <div className="wallet-address__text">Адрес не найден</div>
            </div>
        );
    }

    const displayAddress = showFull
        ? address
        : `${address.slice(0, 6)}...${address.slice(-4)}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy address:', error);
        }
    };

    return (
        <div className="wallet-address">
            <div className="wallet-address__label">Адрес кошелька</div>
            <div className="wallet-address__container">
                <div className="wallet-address__text" title={address}>
                    {displayAddress}
                </div>
                <button
                    className="wallet-address__copy-btn"
                    onClick={handleCopy}
                    title="Копировать адрес"
                >
                    {copied ? '✓ Скопировано' : '📋 Копировать'}
                </button>
            </div>
        </div>
    );
}

