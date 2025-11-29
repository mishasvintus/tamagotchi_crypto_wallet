/**
 * Страница авторизации (разблокировки кошелька)
 */

import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import './LoginPage.css';

interface LoginPageProps {
    onSuccess: () => void;
    onSwitchWallet: () => void; // Переход на страницу создания/импорта нового кошелька
}

export function LoginPage({ onSuccess, onSwitchWallet }: LoginPageProps) {
    const { unlockWallet, deleteWallet } = useWallet();
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password) {
            setError('Введите пароль');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const success = await unlockWallet(password);

            if (success) {
                setPassword(''); // Очищаем пароль из памяти
                // Состояние обновится в useWallet, WalletModule автоматически переключится через useEffect
                // Небольшая задержка для гарантии обновления состояния
                setTimeout(() => {
                    onSuccess();
                }, 100);
            } else {
                setError('Неверный пароль');
            }
        } catch (err) {
            setError('Ошибка при разблокировке кошелька');
            console.error('Error unlocking wallet:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <h2 className="login-page__title">Вход в кошелёк</h2>
            <p className="login-page__subtitle">
                Введите пароль для доступа к кошельку
            </p>

            <form onSubmit={handleLogin} className="login-page__form">
                <div className="login-page__form-group">
                    <label className="login-page__label">
                        Пароль
                    </label>
                    <input
                        type="password"
                        className="login-page__input"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError(null);
                        }}
                        placeholder="Введите пароль"
                        autoFocus
                        disabled={isLoading}
                    />
                </div>

                {error && (
                    <div className="login-page__error">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="login-page__submit-btn"
                    disabled={!password || isLoading}
                >
                    {isLoading ? 'Вход...' : 'Войти'}
                </button>
            </form>

            <div className="login-page__hint">
                💡 Пароль используется для расшифровки данных кошелька, хранящихся локально
            </div>

            <div className="login-page__divider">
                <span>или</span>
            </div>

            <div className="login-page__switch-wallet">
                <p className="login-page__switch-text">
                    Хотите использовать другой кошелёк?
                </p>
                {!showConfirmDelete ? (
                    <button
                        type="button"
                        className="login-page__switch-btn"
                        onClick={() => setShowConfirmDelete(true)}
                    >
                        🔄 Импортировать или создать новый кошелёк
                    </button>
                ) : (
                    <div className="login-page__confirm-delete">
                        <p className="login-page__confirm-text">
                            ⚠️ Внимание! Текущий кошелёк будет удалён из этого приложения.
                        </p>
                        <p className="login-page__confirm-hint">
                            💡 Если у вас сохранена seed-фраза, вы сможете импортировать этот кошелёк снова позже.
                        </p>
                        <div className="login-page__confirm-buttons">
                            <button
                                type="button"
                                className="login-page__confirm-btn login-page__confirm-btn--cancel"
                                onClick={() => setShowConfirmDelete(false)}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className="login-page__confirm-btn login-page__confirm-btn--confirm"
                                onClick={() => {
                                    deleteWallet();
                                    setShowConfirmDelete(false);
                                    onSwitchWallet();
                                }}
                            >
                                Удалить и перейти
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

