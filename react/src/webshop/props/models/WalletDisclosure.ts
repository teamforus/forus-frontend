export default interface WalletDisclosure {
    id: number;
    fund_id: number;
    records: Record<string, string | null>;
    email: string | null;
    can_use_email: boolean;
    verified_at: string;
    verified_at_locale: string;
    expires_at: string;
    expires_at_locale: string;
}
