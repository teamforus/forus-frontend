import React, { useCallback } from 'react';
import Product, { ProductFund } from '../../../../props/models/Product';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import useFetchAuthIdentity from '../../../../hooks/useFetchAuthIdentity';
import ModalProductReserve from '../../../modals/modal-product-reserve/ModalProductReserve';

export default function useReserveProduct(product: Product) {
    const openModal = useOpenModal();
    const fetchAuthIdentity = useFetchAuthIdentity();

    return useCallback(
        (fund: ProductFund & { meta: { reservableVouchers: Voucher[] } }) => {
            fetchAuthIdentity().then(() => {
                openModal((modal) => (
                    <ModalProductReserve
                        fund={fund}
                        modal={modal}
                        product={product}
                        vouchers={fund.meta.reservableVouchers}
                    />
                ));
            });
        },
        [fetchAuthIdentity, openModal, product],
    );
}
