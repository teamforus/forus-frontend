import useSponsorProductOptions, { type ProductFilters } from './useSponsorProductOptions';

const filters: ProductFilters = { unlimited_stock: 1 };

export default function useFundFormulaProducts(organizationId: number | null) {
    return useSponsorProductOptions(organizationId, organizationId ? filters : null);
}
