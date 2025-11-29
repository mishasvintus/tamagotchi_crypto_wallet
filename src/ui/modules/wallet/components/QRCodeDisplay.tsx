/**
 * Компонент отображения QR-кода
 */

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import './QRCodeDisplay.css';

interface QRCodeDisplayProps {
    data: string;
    size?: number;
    title?: string;
}

export function QRCodeDisplay({ data, size = 200, title }: QRCodeDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !data) return;

        QRCode.toCanvas(canvasRef.current, data, {
            width: size,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        }).catch((error) => {
            console.error('Error generating QR code:', error);
        });
    }, [data, size]);

    if (!data) {
        return (
            <div className="qrcode-display">
                <div className="qrcode-display__error">Нет данных для QR-кода</div>
            </div>
        );
    }

    return (
        <div className="qrcode-display">
            {title && <div className="qrcode-display__title">{title}</div>}
            <div className="qrcode-display__canvas-container">
                <canvas ref={canvasRef} className="qrcode-display__canvas" />
            </div>
        </div>
    );
}

