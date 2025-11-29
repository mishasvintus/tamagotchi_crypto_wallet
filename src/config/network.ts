//  Конфигурация сети блокчейна
export interface NetworkConfig {
    name: string;
    chainId: number;
    rpcUrl: string;
    explorerUrl: string;
    faucetUrl?: string;
}

const SEPOLIA_RPC_ENDPOINTS = [
    import.meta.env.VITE_INFURA_RPC_URL,
].filter(Boolean) as string[];

// Конфигурация для Sepolia Testnet
export const SEPOLIA_CONFIG: NetworkConfig = {
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: SEPOLIA_RPC_ENDPOINTS[0],
    explorerUrl: 'https://sepolia.etherscan.io',
    faucetUrl: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
};

// Альтернативные RPC endpoints для fallback
export const SEPOLIA_RPC_FALLBACKS = SEPOLIA_RPC_ENDPOINTS.slice(1);

// Текущая конфигурация сети (по умолчанию Sepolia)
export const CURRENT_NETWORK: NetworkConfig = SEPOLIA_CONFIG;

