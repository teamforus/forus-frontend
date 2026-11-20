import { useMemo } from 'react';
import useSponsorProductOptions, { type ProductFilters } from './useSponsorProductOptions';

export default function useVoucherProducts(organizationId: number, fundId: number | null) {
    const filters = useMemo<ProductFilters | null>(() => {
        if (!fundId) {
            return null;
        }

        return {
            fund_id: fundId,
            state: 'approved',
            expired: 0,
            sold_out: 0,
            price_types: ['regular', 'free', 'discount_fixed', 'discount_percentage'],
        };
    }, [fundId]);

    return useSponsorProductOptions(organizationId, filters);
}
