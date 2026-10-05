export type WalletProvider = 'verid';

export type WalletFlow = {
    id: number;
    provider: WalletProvider;
    key: string;
    name: string;
};
