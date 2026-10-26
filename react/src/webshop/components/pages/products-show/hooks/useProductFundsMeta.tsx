import { useMemo } from 'react';
import Fund from '../../../../props/models/Fund';
import Product from '../../../../props/models/Product';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import useFundMetaBuilder from '../../../../hooks/meta/useFundMetaBuilder';
import { useProductService } from '../../../../services/ProductService';

export default function useProductFundsMeta(
    product: Product,
    funds: Array<Fund>,
    vouchers: Array<Voucher>,
    payouts: Array<PayoutTransaction>,
) {
    const appConfigs = useAppConfigs();
    const productService = useProductService();
    const fundMetaBuilder = useFundMetaBuilder();

    return useMemo(() => {
        if (!product || !funds || !vouchers) {
            return null;
        }

        const meta = productService.checkEligibility(product, vouchers);

        return {
            ...meta,
            funds: meta.funds.map((productFund) => ({
                ...productFund,
                ...fundMetaBuilder(
                    { ...funds.find((fund) => fund.id == productFund.id), ...productFund },
                    payouts,
                    vouchers,
                    appConfigs,
                ),
            })),
        };
    }, [product, funds, vouchers, productService, fundMetaBuilder, payouts, appConfigs]);
}
