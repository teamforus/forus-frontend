export default interface BaseTransaction {
    state: 'success' | 'pending' | 'canceled';
    state_locale: string;
}
