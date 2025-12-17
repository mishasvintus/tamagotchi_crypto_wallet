# Модуль кошелька (Wallet Module)

Модуль криптовалютного кошелька для работы с Ethereum блокчейном. Поддерживает создание, импорт и управление HD-кошельками (BIP-39/BIP-44), отправку и получение ETH, а также просмотр истории транзакций.

## Содержание

- [Архитектура](#архитектура)
- [Слои приложения](#слои-приложения)
- [Core Layer](#core-layer)
- [Service Layer](#service-layer)
- [UI Layer](#ui-layer)
- [Зависимости](#зависимости)
- [Конфигурация](#конфигурация)
- [Безопасность](#безопасность)
- [Event Bus](#event-bus)

---

## Архитектура

Модуль построен по принципу трёхслойной архитектуры:

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ WalletModule │ │    Pages     │ │     Components       │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│                          │                                   │
│                   ┌──────┴──────┐                           │
│                   │  useWallet  │  (React Hook)             │
│                   └─────────────┘                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                    Service Layer                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   WalletService                          ││
│  │  • createWallet()      • getBalance()                    ││
│  │  • importWallet()      • sendTransaction()               ││
│  │  • unlockWallet()      • getTransactionHistory()         ││
│  │  • lockWallet()        • exportMnemonic()                ││
│  └─────────────────────────────────────────────────────────┘│
│                          │                                   │
│  ┌──────────────────────┐│                                   │
│  │      EventBus        ││ (События между модулями)         │
│  └──────────────────────┘│                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                     Core Layer                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │    Wallet    │ │   Storage    │ │     Blockchain       │ │
│  │  Generator   │ │  (encrypted) │ │     Provider         │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│                                          │                   │
│                               ┌──────────┴──────────┐       │
│                               │   EtherscanAPI      │       │
│                               └─────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## Слои приложения

### Структура файлов

```
src/
├── config/
│   └── network.ts              # Конфигурация сети (Sepolia)
├── core/
│   ├── blockchain/
│   │   ├── etherscan-api.ts    # API для истории транзакций
│   │   ├── provider.ts         # Подключение к блокчейну
│   │   └── types.ts            # Типы транзакций
│   ├── storage/
│   │   ├── encryption.ts       # AES-256 шифрование
│   │   ├── types.ts            # Типы хранилища
│   │   └── wallet-storage.ts   # Сохранение/загрузка кошелька
│   └── wallet/
│       ├── types.ts            # Типы данных кошелька
│       └── wallet-generator.ts # Генерация HD-кошельков
├── services/
│   ├── event-bus.ts            # Шина событий
│   └── wallet-service.ts       # Сервис кошелька (singleton)
└── ui/modules/wallet/
    ├── components/             # UI компоненты
    ├── hooks/
    │   └── useWallet.ts        # React хук
    ├── pages/                  # Страницы
    ├── WalletModule.tsx        # Главный компонент
    └── WalletModule.css
```

---

## Core Layer

Core Layer содержит низкоуровневую логику работы с кошельком, блокчейном и хранилищем данных.

### Wallet Generator (`core/wallet/wallet-generator.ts`)

Генерация и импорт HD-кошельков по стандартам BIP-39/BIP-44.

```typescript
class WalletGenerator {
    // Генерация мнемоники (12 или 24 слова)
    generateMnemonic(strength: 128 | 256): string;
    
    // Валидация мнемонической фразы
    validateMnemonic(mnemonic: string): boolean;
    
    // Создание кошелька из мнемоники
    createWalletFromMnemonic(mnemonic: string, index?: number): WalletData;
    
    // Генерация нового кошелька с мнемоникой
    generateNewWallet(strength?: 128 | 256): CreateWalletResult;
    
    // Импорт кошелька из мнемоники
    importWalletFromMnemonic(mnemonic: string, index?: number): ImportWalletResult;
}
```

**Используемые библиотеки:**
- `@scure/bip39` — генерация и валидация мнемоники
- `ethers` — деривация ключей (HDNodeWallet)

**Путь деривации:** `m/44'/60'/0'/0/{index}` (стандарт Ethereum)

### Encryption (`core/storage/encryption.ts`)

Шифрование приватных данных кошелька с использованием AES-256.

```typescript
// Шифрование данных
function encrypt(data: string, password: string): string;

// Расшифровка данных
function decrypt(encryptedData: string, password: string): string;

// Генерация соли
function generateSalt(): string;
```

**Используемая библиотека:** `crypto-js`

### Wallet Storage (`core/storage/wallet-storage.ts`)

Безопасное хранение зашифрованных данных кошелька в `localStorage`.

```typescript
class WalletStorage {
    // Сохранение кошелька (шифрует privateKey и mnemonic)
    saveWallet(walletData: WalletData, password: string): Promise<SaveWalletResult>;
    
    // Загрузка и расшифровка кошелька
    loadWallet(password: string): Promise<LoadWalletResult>;
    
    // Проверка наличия сохранённого кошелька
    hasWallet(): boolean;
    
    // Удаление кошелька
    clearWallet(): void;
    
    // Получение адреса без расшифровки
    getAddress(): string | null;
}
```

**Структура хранения:**
```typescript
interface EncryptedWalletData {
    encryptedPrivateKey: string;  // Зашифрованный приватный ключ
    encryptedMnemonic: string;    // Зашифрованная мнемоника
    address: string;              // Адрес (не зашифрован)
    publicKey: string;            // Публичный ключ (не зашифрован)
    salt: string;                 // Соль для шифрования
}
```

### Blockchain Provider (`core/blockchain/provider.ts`)

Подключение к Ethereum сети с поддержкой fallback RPC endpoints.

```typescript
class BlockchainProvider {
    // Получение баланса в ETH
    getBalance(address: string): Promise<string>;
    
    // Отправка подписанной транзакции
    sendTransaction(signedTransaction: string): Promise<TransactionResult>;
    
    // Получение информации о транзакции
    getTransaction(txHash: string): Promise<TransactionResult | null>;
    
    // Оценка газа для транзакции
    estimateGas(to: string, value: string): Promise<GasEstimate>;
    
    // Получение текущей цены газа
    getGasPrice(): Promise<bigint>;
    
    // Получение провайдера ethers
    getProvider(): ethers.Provider;
    
    // Получение конфигурации сети
    getNetwork(): NetworkConfig;
}
```

**Особенности:**
- Автоматическое переключение между RPC endpoints при ошибках
- Таймауты запросов (10 сек для чтения, 60 сек для транзакций)
- Поддержка Infura и публичных RPC

### Etherscan API (`core/blockchain/etherscan-api.ts`)

Получение истории транзакций через Etherscan V2 API.

```typescript
class EtherscanAPI {
    // Получение истории транзакций
    getTransactionHistory(
        address: string,
        startBlock?: number,
        endBlock?: number,
        useCache?: boolean
    ): Promise<Transaction[]>;
    
    // Очистка кэша
    clearCache(address?: string): void;
    
    // Получение URL транзакции в эксплорере
    getTransactionUrl(txHash: string): string;
}
```

**Особенности:**
- Кэширование результатов (60 секунд)
- Поддержка V2 API (обязательно с 2024 года)
- Требует API ключ (`VITE_ETHERSCAN_API_KEY`)

---

## Service Layer

### Wallet Service (`services/wallet-service.ts`)

Главный сервис для работы с кошельком. Связывает Core Layer с UI через единый интерфейс.

```typescript
interface IWalletService {
    // Управление кошельком
    createWallet(password: string): Promise<CreateWalletResult>;
    importWallet(mnemonic: string, password: string): Promise<ImportWalletResult>;
    unlockWallet(password: string): Promise<boolean>;
    lockWallet(): void;
    deleteWallet(): void;
    isWalletUnlocked(): boolean;
    getWallet(): WalletData | null;
    isWalletCreated(): boolean;

    // Работа с блокчейном
    getBalance(): Promise<string>;
    sendTransaction(to: string, amount: string, password: string): Promise<TransactionResult>;
    getTransactionHistory(): Promise<Transaction[]>;

    // Утилиты
    getAddress(): string | null;
    exportMnemonic(password: string): Promise<string>;
    validateAddress(address: string): boolean;
    refreshBalance(): Promise<string>;
}
```

**Кэширование:**
- Разблокированный кошелёк хранится в памяти (`cachedWallet`)
- При блокировке (`lockWallet`) кэш очищается
- При удалении (`deleteWallet`) очищается кэш и localStorage

**Отправка транзакций:**
1. Валидация адреса получателя
2. Загрузка кошелька с паролем
3. Получение nonce для адреса
4. Оценка газа
5. Подписание и отправка транзакции
6. Ожидание подтверждения
7. Отправка события через EventBus

---

## UI Layer

### Wallet Module (`ui/modules/wallet/WalletModule.tsx`)

Главный компонент модуля. Управляет навигацией между страницами на основе состояния кошелька.

**Логика навигации:**
```
┌─────────────────────────────────────────────────────────┐
│                    WalletModule                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  isWalletCreated = false  ───────►  CreateWalletPage    │
│         OR                                               │
│  isSeedPendingConfirmation                              │
│                                                          │
│  isWalletUnlocked = false ───────►  LoginPage           │
│                                                          │
│  isWalletUnlocked = true  ───────►  WalletHomePage      │
│                                      │                   │
│                                      ├──► SendPage       │
│                                      ├──► ReceivePage    │
│                                      └──► TransactionHistoryPage
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### useWallet Hook (`ui/modules/wallet/hooks/useWallet.ts`)

React хук для работы с кошельком в компонентах.

```typescript
interface UseWalletReturn {
    // Состояние
    wallet: WalletData | null;
    address: string | null;
    balance: string | null;
    isLoading: boolean;
    isBalanceLoading: boolean;
    error: string | null;
    isWalletCreated: boolean;
    isWalletUnlocked: boolean;

    // Действия
    createWallet: (password: string) => Promise<CreateWalletResult>;
    importWallet: (mnemonic: string, password: string) => Promise<ImportWalletResult>;
    unlockWallet: (password: string) => Promise<boolean>;
    lockWallet: () => void;
    deleteWallet: () => void;
    refreshBalance: () => Promise<void>;
    sendTransaction: (to: string, amount: string, password: string) => Promise<TransactionResult>;
    getTransactionHistory: (forceRefresh?: boolean) => Promise<Transaction[]>;
    exportMnemonic: (password: string) => Promise<string>;
    validateAddress: (address: string) => boolean;
    clearError: () => void;
}
```

**Особенности:**
- Автоматическое обновление баланса каждые 30 секунд
- Проверка состояния кошелька каждую секунду
- Раздельные состояния загрузки (`isLoading`, `isBalanceLoading`)

### Страницы

| Страница | Файл | Описание |
|----------|------|----------|
| CreateWalletPage | `pages/CreateWalletPage.tsx` | Создание или импорт кошелька |
| LoginPage | `pages/LoginPage.tsx` | Разблокировка кошелька паролем |
| WalletHomePage | `pages/WalletHomePage.tsx` | Главная страница с балансом |
| SendPage | `pages/SendPage.tsx` | Отправка ETH |
| ReceivePage | `pages/ReceivePage.tsx` | Получение ETH (QR-код) |
| TransactionHistoryPage | `pages/TransactionHistoryPage.tsx` | История транзакций |

### Компоненты

| Компонент | Описание |
|-----------|----------|
| `SeedPhraseDisplay` | Отображение и подтверждение seed-фразы |
| `QRCodeDisplay` | QR-код для адреса |
| `WalletAddress` | Отображение адреса с копированием |
| `WalletBalance` | Отображение баланса |
| `TransactionItem` | Элемент списка транзакций |
| `TransactionConfirmation` | Модал подтверждения транзакции |
| `ErrorDisplay` | Отображение ошибок |
| `LoadingSpinner` | Индикатор загрузки |

---

## Зависимости

### Основные библиотеки

| Библиотека | Версия | Назначение |
|------------|--------|------------|
| `ethers` | ^6.15.0 | Работа с Ethereum (провайдеры, подписание, HD-кошельки) |
| `@scure/bip39` | ^2.0.1 | Генерация и валидация мнемоники (BIP-39) |
| `@scure/bip32` | ^2.0.1 | Деривация ключей (BIP-32) |
| `crypto-js` | ^4.2.0 | AES-256 шифрование |
| `axios` | ^1.13.2 | HTTP клиент для Etherscan API |
| `qrcode` | ^1.5.4 | Генерация QR-кодов |
| `react` | ^18.2.0 | UI фреймворк |

### Диаграмма зависимостей

```
WalletModule
    │
    ├── useWallet (hook)
    │       │
    │       └── WalletService (singleton)
    │               │
    │               ├── WalletGenerator
    │               │       ├── @scure/bip39
    │               │       └── ethers (HDNodeWallet)
    │               │
    │               ├── WalletStorage
    │               │       └── encryption (crypto-js)
    │               │
    │               ├── BlockchainProvider
    │               │       └── ethers (Provider)
    │               │
    │               ├── EtherscanAPI
    │               │       └── axios
    │               │
    │               └── EventBus
    │
    └── Pages/Components
            └── qrcode (для ReceivePage)
```

---

## Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Infura RPC URL для подключения к Sepolia
VITE_INFURA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY

# Etherscan API ключ для истории транзакций
VITE_ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

**Получение ключей:**
- Infura: https://infura.io/
- Etherscan: https://etherscan.io/apis

### Конфигурация сети (`config/network.ts`)

```typescript
export const SEPOLIA_CONFIG: NetworkConfig = {
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: import.meta.env.VITE_INFURA_RPC_URL,
    explorerUrl: 'https://sepolia.etherscan.io',
    faucetUrl: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
};
```

---

## Безопасность

### Хранение данных

1. **Приватный ключ и мнемоника** — шифруются AES-256 перед сохранением
2. **Пароль** — не сохраняется, используется только для шифрования/расшифровки
3. **Адрес и публичный ключ** — хранятся в открытом виде (не секретны)

### Жизненный цикл кошелька

```
Создание:
  [password] + [mnemonic] ──► encrypt() ──► localStorage

Разблокировка:
  localStorage + [password] ──► decrypt() ──► cachedWallet (память)

Блокировка:
  cachedWallet = null (память очищается)

Удаление:
  localStorage.removeItem() + cachedWallet = null
```

### Рекомендации

- Минимальная длина пароля: 8 символов
- Seed-фраза показывается только один раз при создании
- После подтверждения seed-фразы требуется её сохранить
- Пароль запрашивается при каждой транзакции

---

## Event Bus

Шина событий для связи между модулями приложения.

### Типы событий

```typescript
type WalletEventType =
    | 'wallet:created'             // Кошелёк создан
    | 'wallet:unlocked'            // Кошелёк разблокирован
    | 'wallet:transaction-sent'    // Транзакция отправлена
    | 'wallet:transaction-received'// Транзакция получена
    | 'wallet:balance-changed';    // Баланс изменился
```

### Использование

```typescript
import { eventBus } from '@/services/event-bus';

// Подписка на событие
const unsubscribe = eventBus.on('wallet:transaction-sent', (data) => {
    console.log('Transaction sent:', data.hash);
});

// Отправка события
eventBus.emit('wallet:balance-changed', {
    address: '0x...',
    balance: '1.5',
    previousBalance: '1.0'
});

// Отписка
unsubscribe();
```

### Данные событий

```typescript
// wallet:created, wallet:unlocked
interface WalletCreatedEvent {
    address: string;
}

// wallet:transaction-sent, wallet:transaction-received
interface TransactionEvent {
    hash: string;
    from: string;
    to: string;
    value: string;
    type: 'sent' | 'received';
}

// wallet:balance-changed
interface BalanceChangedEvent {
    address: string;
    balance: string;
    previousBalance?: string;
}
```

---

## Типы данных

### WalletData

```typescript
interface WalletData {
    address: string;      // Ethereum адрес
    privateKey: string;   // Приватный ключ (хранить зашифрованным!)
    mnemonic: string;     // Мнемоника (хранить зашифрованной!)
    publicKey: string;    // Публичный ключ
}
```

### Transaction

```typescript
interface Transaction {
    hash: string;                              // Хеш транзакции
    from: string;                              // Адрес отправителя
    to: string;                                // Адрес получателя
    value: string;                             // Сумма в ETH
    gasUsed: bigint;                           // Использованный газ
    gasPrice: bigint;                          // Цена газа
    status: 'pending' | 'confirmed' | 'failed';// Статус
    blockNumber?: number;                      // Номер блока
    timestamp?: number;                        // Unix timestamp
    type: 'sent' | 'received';                 // Тип (отправлена/получена)
}
```

### GasEstimate

```typescript
interface GasEstimate {
    gasLimit: bigint;              // Лимит газа
    gasPrice: bigint;              // Цена газа
    maxFeePerGas?: bigint;         // EIP-1559
    maxPriorityFeePerGas?: bigint; // EIP-1559
    totalCost: string;             // Общая стоимость в ETH
}
```

---

## Тестовые токены

Для тестирования на Sepolia используйте faucet:

**Google Cloud Faucet:** https://cloud.google.com/application/web3/faucet/ethereum/sepolia

---

## Лицензия

MIT

