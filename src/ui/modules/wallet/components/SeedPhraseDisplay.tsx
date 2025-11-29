/**
 * Компонент безопасного отображения seed-фразы
 */

import { useState } from 'react';
import './SeedPhraseDisplay.css';

interface SeedPhraseDisplayProps {
    mnemonic: string;
    onConfirm?: () => void;
    showConfirmButton?: boolean;
}

export function SeedPhraseDisplay({
    mnemonic,
    onConfirm,
    showConfirmButton = true
}: SeedPhraseDisplayProps) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const words = mnemonic.split(' ');

    const handleReveal = () => {
        setIsRevealed(true);
    };

    const handleConfirm = () => {
        setIsConfirmed(true);
        if (onConfirm) {
            onConfirm();
        }
    };

    return (
        <div className="seed-phrase-display">
            <div className="seed-phrase-display__warning">
                ⚠️ <strong>ВАЖНО:</strong> Сохраните эту фразу в безопасном месте.
                Без неё вы не сможете восстановить доступ к кошельку!
            </div>

            {!isRevealed ? (
                <div className="seed-phrase-display__hidden">
                    <button
                        className="seed-phrase-display__reveal-btn"
                        onClick={handleReveal}
                    >
                        Показать seed-фразу
                    </button>
                </div>
            ) : (
                <>
                    <div className="seed-phrase-display__words">
                        {words.map((word, index) => (
                            <div key={index} className="seed-phrase-display__word">
                                <span className="seed-phrase-display__word-number">{index + 1}</span>
                                <span className="seed-phrase-display__word-text">{word}</span>
                            </div>
                        ))}
                    </div>

                    {showConfirmButton && !isConfirmed && (
                        <div className="seed-phrase-display__confirm">
                            <button
                                className="seed-phrase-display__confirm-btn"
                                onClick={handleConfirm}
                            >
                                Я сохранил seed-фразу
                            </button>
                        </div>
                    )}

                    {isConfirmed && (
                        <div className="seed-phrase-display__confirmed">
                            ✓ Seed-фраза подтверждена
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

