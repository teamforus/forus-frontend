const ProductService = function(ApiRequest, ArrService) {
    const uriPrefix = '/platform/products';

    return new (function() {
        this.list = function(data) {
            return ApiRequest.get(uriPrefix, data);
        }

        this.sample = function(fund_type, per_page = 6) {
            return ApiRequest.get(`${uriPrefix}/sample`, { fund_type, per_page });
        }

        this.read = function(id) {
            return ApiRequest.get(`${uriPrefix}/${id}`);
        }

        this.calcExpireDate = function(dates) {
            const dateParse = (date, date_locale) => {
                return date ? {
                    unix: moment(typeof date === 'object' ? date.date : date).unix(),
                    locale: date_locale,
                } : false;
            };

            const sortDateLocale = (dates, asc = true) => {
                return [...dates].sort((a, b) => {
                    return a.unix == b.unix ? 0 : (a.unix < b.unix ? (asc ? -1 : 1) : (asc ? 1 : -1));
                });
            };

            return sortDateLocale(dates.filter(date => date).map((date) => {
                return dateParse(date[0], date[1]);
            }), true)[0] || null;
        }

        this.checkEligibility = function(product, vouchers) {
            const fundIds = product.funds.map(fund => fund.id);
            const productAvailable = !product.sold_out && !product.deleted && !product.expired;

            // regular active vouchers for product funds
            const regularActiveVouchers = vouchers.filter((voucher) => {
                return (fundIds.indexOf(voucher.fund_id) != -1) &&
                    (voucher.type === 'regular') &&
                    !voucher.expired;
            });

            const funds = [...product.funds].map((fund) => {
                const { reservations_enabled } = fund;

                const applicableVouchers = regularActiveVouchers.filter(voucher => voucher.fund.id == fund.id);
                const reservableVouchers = applicableVouchers.filter(voucher => voucher.query_product && voucher.query_product.reservable);

                const isReservable = reservableVouchers.length > 0;
                const isReservationAvailable = isReservable && productAvailable && reservations_enabled;

                const voucherDates = applicableVouchers.map((voucher) => voucher.query_product ? [
                    voucher.query_product.reservable_expire_at,
                    voucher.query_product.reservable_expire_at_locale,
                ] : null).filter(date => date);

                const productAndFundDates = [
                    fund.end_at ? [fund.end_at, fund.end_at_locale] : null,
                    product.expire_at ? [product.expire_at, product.expire_at_locale] : null
                ].filter(date => date);

                const shownExpireDate = this.calcExpireDate([...voucherDates, ...productAndFundDates]);

                return {
                    ...fund,
                    ...{ meta: { shownExpireDate, applicableVouchers, reservableVouchers, isReservationAvailable } },
                };
            })

            return { regularActiveVouchers, funds };
        }
    });
};

module.exports = [
    'ApiRequest',
    'ArrService',
    ProductService
];