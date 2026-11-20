import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import Product from '../../../../../props/models/Product';
import useIsPayoutInfoProduct from '../../../../pages/products-show/hooks/useIsPayoutInfoProduct';
import useAppConfigs from '../../../../../hooks/useAppConfigs';

export default function useProductPriceMinLocale(product: Product) {
    const appConfigs = useAppConfigs();
    const translate = useTranslate();
    const isPayoutInfoProduct = useIsPayoutInfoProduct(product, appConfigs);

    if (!product) {
        return null;
    }

    return isPayoutInfoProduct ? translate('product.price.payout') : product.price_min_locale;
}
