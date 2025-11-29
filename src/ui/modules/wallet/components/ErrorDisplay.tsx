/**
 * Компонент отображения ошибок с улучшенным UX
 */

import './ErrorDisplay.css';

interface ErrorDisplayProps {
    error: string | null;
    onDismiss?: () => void;
    type?: 'error' | 'warning' | 'info';
}

export function ErrorDisplay({ error, onDismiss, type = 'error' }: ErrorDisplayProps) {
    if (!error) return null;

    const getIcon = () => {
        switch (type) {
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '❌';
        }
    };

    return (
        <div className={`error-display error-display--${type}`}>
            <div className="error-display__content">
                <span className="error-display__icon">{getIcon()}</span>
                <span className="error-display__message">{error}</span>
            </div>
            {onDismiss && (
                <button
                    className="error-display__dismiss"
                    onClick={onDismiss}
                    aria-label="Закрыть"
                >
                    ×
                </button>
            )}
        </div>
    );
}

