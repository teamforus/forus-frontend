import ApiResponse, { ApiResponseSingle, RequestConfig, ResponseSimple } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import RequesterProduct from '../props/models/Product';
import type BasicProduct from '../../props/models/BasicProduct';
import Voucher from '../../dashboard/props/models/Voucher';

export class ProductService {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService = new ApiRequestService()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/products';

    /**
     * Fetch list
     */
    public list<F extends object>(
        data: F & { simplified: true | 1 | '1' },
        config?: RequestConfig,
    ): Promise<ApiResponse<BasicProduct>>;
    public list<F extends object>(
        data?: F & { simplified?: false | 0 | '0' },
        config?: RequestConfig,
    ): Promise<ApiResponse<RequesterProduct, { price_max: string }>>;
    public list<F extends object>(
        data: F & { simplified: boolean | 0 | 1 | '0' | '1' },
        config?: RequestConfig,
    ): Promise<ApiResponse<BasicProduct> | ApiResponse<RequesterProduct, { price_max: string }>>;
    public list(data: object = {}, config = {}): Promise<ApiResponse<BasicProduct> | ApiResponse<RequesterProduct>> {
        return this.apiRequest.get(`${this.prefix}`, data, config);
    }

    public sample(per_page = 6): Promise<ResponseSimple<{ data: RequesterProduct[] }>> {
        return this.apiRequest.get(`${this.prefix}/sample`, { per_page });
    }

    public read(id: number, config = {}): Promise<ApiResponseSingle<RequesterProduct>> {
        return this.apiRequest.get(`${this.prefix}/${id}`, {}, config);
    }

    public bookmark(id: number): Promise<ApiResponseSingle<RequesterProduct>> {
        return this.apiRequest.post(`${this.prefix}/${id}/bookmark`);
    }

    public removeBookmark(id: number): Promise<ApiResponseSingle<RequesterProduct>> {
        return this.apiRequest.post(`${this.prefix}/${id}/remove-bookmark`);
    }

    public checkEligibility(product: RequesterProduct, vouchers: Array<Voucher> = []) {
        const fundIds = product.funds.map((fund) => fund.id);
        const productAvailable = !product.sold_out && !product.deleted && !product.expired;

        // regular active vouchers for product funds
        const regularActiveVouchers = vouchers.filter((voucher) => {
            return fundIds.indexOf(voucher.fund.id) != -1 && voucher.type === 'regular' && !voucher.expired;
        });

        const funds = [...product.funds].map((fund) => {
            const { feature_reservations_enabled, feature_reservation_extra_payments_enabled } = fund;

            const applicableVouchers = regularActiveVouchers.filter((voucher) => voucher.fund.id == fund.id);
            const reservableVouchers = applicableVouchers.filter(
                (voucher) => voucher.query_product && voucher.query_product.reservable,
            );

            const isReservable = reservableVouchers.length > 0;
            const isReservationAvailable = isReservable && productAvailable && feature_reservations_enabled;
            const isReservationExtraPaymentAvailable =
                isReservationAvailable && feature_reservation_extra_payments_enabled;

            const meta = {
                ...{ applicableVouchers, reservableVouchers },
                ...{ isReservationAvailable, isReservationExtraPaymentAvailable },
            };

            return { ...fund, meta };
        });

        const hasReservableFunds = funds.filter((fund) => fund.meta.isReservationAvailable).length > 0;

        return { regularActiveVouchers, funds, hasReservableFunds };
    }

    public getSortOptions(translate: (key: string) => string): Array<{
        id: number;
        label: string;
        value: { order_by: 'created_at' | 'price' | 'most_popular' | 'name' | 'randomized'; order_dir: 'asc' | 'desc' };
    }> {
        return [
            {
                id: 1,
                label: translate('products.sort.created_at_desc'),
                value: { order_by: 'created_at', order_dir: 'desc' },
            },
            {
                id: 2,
                label: translate('products.sort.created_at_asc'),
                value: { order_by: 'created_at', order_dir: 'asc' },
            },
            { id: 3, label: translate('products.sort.price_asc'), value: { order_by: 'price', order_dir: 'asc' } },
            { id: 4, label: translate('products.sort.price_desc'), value: { order_by: 'price', order_dir: 'desc' } },
            {
                id: 5,
                label: translate('products.sort.most_popular'),
                value: { order_by: 'most_popular', order_dir: 'desc' },
            },
            { id: 6, label: translate('products.sort.name_asc'), value: { order_by: 'name', order_dir: 'asc' } },
            { id: 7, label: translate('products.sort.name_desc'), value: { order_by: 'name', order_dir: 'desc' } },
            {
                id: 8,
                label: translate('products.sort.randomized'),
                value: { order_by: 'randomized', order_dir: 'desc' },
            },
        ];
    }

    public transformProductAlternativeText(product: RequesterProduct): string {
        return product.alternative_text || '';
    }
}

export function useProductService(): ProductService {
    return useState(new ProductService())[0];
}
