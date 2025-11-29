/**
 * Шифрование данных кошелька
 * Использует AES-256 для шифрования приватных ключей и seed-фраз
 */

import CryptoJS from 'crypto-js';

/**
 * Шифрование данных
 * @param data - Данные для шифрования
 * @param password - Пароль для шифрования
 * @returns Зашифрованная строка
 */
export function encrypt(data: string, password: string): string {
    return CryptoJS.AES.encrypt(data, password).toString();
}

/**
 * Расшифровка данных
 * @param encryptedData - Зашифрованные данные
 * @param password - Пароль для расшифровки
 * @returns Расшифрованная строка
 */
export function decrypt(encryptedData: string, password: string): string {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, password);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) {
            throw new Error('Invalid password or corrupted data');
        }

        return decrypted;
    } catch (error) {
        throw new Error('Failed to decrypt data. Invalid password?');
    }
}

/**
 * Генерация соли для дополнительной безопасности
 * @returns Случайная соль
 */
export function generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
}

