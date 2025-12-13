/**
 * Страница создания/импорта кошелька
 */

import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { SeedPhraseDisplay } from '../components/SeedPhraseDisplay';
import './CreateWalletPage.css';

type Mode = 'select' | 'create' | 'import';

interface CreateWalletPageProps {
    onSeedConfirmed?: () => void;
}

export function CreateWalletPage({ onSeedConfirmed }: CreateWalletPageProps = {}) {
    const { createWallet, importWallet, error, clearError } = useWallet();
    const [mode, setMode] = useState<Mode>('select');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mnemonic, setMnemonic] = useState('');
    const [generatedMnemonic, setGeneratedMnemonic] = useState<string | null>(null);
    const [seedConfirmed, setSeedConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateWallet = async () => {
        if (!password || password.length < 8) {
            alert('Пароль должен быть не менее 8 символов');
            return;
        }

        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        try {
            setIsSubmitting(true);
            clearError();
            const result = await createWallet(password);
            setGeneratedMnemonic(result.mnemonic);
            setMode('create');
            localStorage.setItem('wallet_seed_pending_confirmation', 'true');
        } catch (err) {
            console.error('Error creating wallet:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImportWallet = async () => {
        if (!mnemonic.trim()) {
            alert('Введите seed-фразу');
            return;
        }

        if (!password || password.length < 8) {
            alert('Пароль должен быть не менее 8 символов');
            return;
        }

        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        try {
            setIsSubmitting(true);
            clearError();
            const result = await importWallet(mnemonic.trim(), password);
            if (!result.success) {
                alert(result.error || 'Не удалось импортировать кошелёк');
            } else {
                localStorage.removeItem('wallet_seed_pending_confirmation');
            }
        } catch (err) {
            console.error('Error importing wallet:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSeedConfirmed = () => {
        setSeedConfirmed(true);
        localStorage.removeItem('wallet_seed_pending_confirmation');
        if (onSeedConfirmed) {
            onSeedConfirmed();
        }
        // После подтверждения кошелёк создан и автоматически разблокирован
        // Состояние обновится автоматически через useWallet
        // Небольшая задержка для показа сообщения об успехе
    };

    if (mode === 'select') {
        return (
            <div className="create-wallet-page">
                <h2 className="create-wallet-page__title">Создание кошелька</h2>
                <div className="create-wallet-page__options">
                    <button
                        className="create-wallet-page__option"
                        onClick={() => setMode('create')}
                    >
                        <div className="create-wallet-page__option-icon">✨</div>
                        <div className="create-wallet-page__option-title">Создать новый кошелёк</div>
                        <div className="create-wallet-page__option-description">
                            Сгенерировать новый кошелёк с новой seed-фразой
                        </div>
                    </button>
                    <button
                        className="create-wallet-page__option"
                        onClick={() => setMode('import')}
                    >
                        <div className="create-wallet-page__option-icon">📥</div>
                        <div className="create-wallet-page__option-title">Импортировать кошелёк</div>
                        <div className="create-wallet-page__option-description">
                            Восстановить кошелёк из существующей seed-фразы
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'create' && generatedMnemonic) {
        return (
            <div className="create-wallet-page">
                <h2 className="create-wallet-page__title">Сохраните seed-фразу</h2>
                <SeedPhraseDisplay
                    mnemonic={generatedMnemonic}
                    onConfirm={handleSeedConfirmed}
                />
                {seedConfirmed && (
                    <div className="create-wallet-page__success">
                        Кошелёк успешно создан!
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="create-wallet-page">
            <h2 className="create-wallet-page__title">
                {mode === 'create' ? 'Создать новый кошелёк' : 'Импортировать кошелёк'}
            </h2>

            {mode === 'import' && (
                <div className="create-wallet-page__form-group">
                    <label className="create-wallet-page__label">
                        Seed-фраза (12 или 24 слова)
                    </label>
                    <textarea
                        className="create-wallet-page__textarea"
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        placeholder="word1 word2 word3 ..."
                        rows={3}
                    />
                </div>
            )}

            <div className="create-wallet-page__form-group">
                <label className="create-wallet-page__label">
                    Пароль (минимум 8 символов)
                </label>
                <input
                    type="password"
                    className="create-wallet-page__input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                />
                <div className="create-wallet-page__hint">
                    {mode === 'import'
                        ? 'Пароль используется для шифрования данных кошелька в этом приложении. Seed-фраза восстанавливает кошелёк, а пароль защищает локальные данные.'
                        : 'Пароль используется для шифрования данных кошелька'
                    }
                </div>
            </div>

            <div className="create-wallet-page__form-group">
                <label className="create-wallet-page__label">
                    Подтвердите пароль
                </label>
                <input
                    type="password"
                    className="create-wallet-page__input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторите пароль"
                />
            </div>

            {error && (
                <div className="create-wallet-page__error">
                    {error}
                </div>
            )}

            <div className="create-wallet-page__actions">
                <button
                    className="create-wallet-page__cancel-btn"
                    onClick={() => {
                        setMode('select');
                        setPassword('');
                        setConfirmPassword('');
                        setMnemonic('');
                        clearError();
                    }}
                    disabled={isSubmitting}
                >
                    Назад
                </button>
                <button
                    className="create-wallet-page__submit-btn"
                    onClick={mode === 'create' ? handleCreateWallet : handleImportWallet}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Обработка...' : (mode === 'create' ? 'Создать' : 'Импортировать')}
                </button>
            </div>
        </div>
    );
}

