/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_RPC_URL?: string;
    readonly VITE_INFURA_RPC_URL?: string;
    readonly VITE_ETHERSCAN_API_KEY?: string;
    readonly VITE_EXPLORER_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare global {
    interface Window {
        Buffer: typeof Buffer;
    }
    var Buffer: typeof Buffer;
}

