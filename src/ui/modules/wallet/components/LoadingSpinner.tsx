/**
 * Компонент индикатора загрузки
 */

import './LoadingSpinner.css';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
}

export function LoadingSpinner({ size = 'medium', text }: LoadingSpinnerProps) {
    return (
        <div className={`loading-spinner loading-spinner--${size}`}>
            <div className="loading-spinner__spinner"></div>
            {text && <div className="loading-spinner__text">{text}</div>}
        </div>
    );
}

