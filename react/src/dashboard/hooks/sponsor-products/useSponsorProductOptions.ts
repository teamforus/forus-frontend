import { useEffect, useState } from 'react';
import type { ProductPriceType } from '../../../props/models/BaseProduct';
import type SponsorProduct from '../../props/models/Sponsor/SponsorProduct';
import { useHelperService } from '../../services/HelperService';
import useProductService from '../../services/ProductService';
import useLatestRequest from '../useLatestRequest';
import usePushApiError from '../usePushApiError';

export type ProductFilters = {
    fund_id?: number;
    state?: 'approved' | 'pending';
    expired?: 0 | 1;
    sold_out?: 0 | 1;
    unlimited_stock?: 0 | 1;
    price_types?: ProductPriceType[];
};

export default function useSponsorProductOptions(organizationId: number | null, filters: ProductFilters | null) {
    const pushApiError = usePushApiError();

    const helperService = useHelperService();
    const productService = useProductService();

    const [result, setResult] = useState<{
        organizationId: number;
        filters: ProductFilters;
        products: SponsorProduct[];
    }>();

    const runLatestRequest = useLatestRequest();

    useEffect(() => {
        runLatestRequest(
            async (config) => {
                if (!filters || !organizationId) {
                    return;
                }

                const products = await helperService.recursiveLeach<SponsorProduct>(
                    (page) =>
                        productService.sponsorProducts(
                            organizationId,
                            { ...filters, order_by: 'name', order_dir: 'asc', per_page: 100, page },
                            config,
                        ),
                    4,
                );

                return { organizationId, filters, products };
            },
            { onSuccess: setResult, onError: pushApiError },
        );
    }, [organizationId, filters, helperService, productService, runLatestRequest, pushApiError]);

    return result && result.organizationId === organizationId && result.filters === filters ? result.products : null;
}
