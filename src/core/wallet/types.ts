/**
 * Типы для работы с кошельком
 */

/**
 * Данные кошелька
 * ВАЖНО: privateKey и mnemonic должны храниться только в зашифрованном виде!
 */
export interface WalletData {
    address: string;
    privateKey: string; // ВАЖНО: хранить зашифрованным!
    mnemonic: string;   // ВАЖНО: хранить зашифрованным!
    publicKey: string;
}

/**
 * Зашифрованные данные кошелька для хранения
 */
export interface EncryptedWalletData {
    encryptedPrivateKey: string;
    encryptedMnemonic: string;
    address: string;
    publicKey: string;
    salt: string; // Соль для шифрования
}

/**
 * Результат создания кошелька
 */
export interface CreateWalletResult {
    wallet: WalletData;
    mnemonic: string; // Показывается только один раз при создании
}

/**
 * Результат импорта кошелька
 */
export interface ImportWalletResult {
    wallet: WalletData;
    success: boolean;
    error?: string;
}

