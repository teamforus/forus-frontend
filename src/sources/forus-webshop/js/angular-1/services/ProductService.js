const ProductService = function(ApiRequest, PushNotificationsService) {
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

        this.bookmark = function(id) {
            return ApiRequest.post(`${uriPrefix}/${id}/bookmark`);
        }

        this.removeBookmark = function(id) {
            return ApiRequest.post(`${uriPrefix}/${id}/remove-bookmark`);
        }

        this.toggleBookmark = function(product) {
            product.bookmarked = !product.bookmarked;

            if (product.bookmarked) {
                this.bookmark(product.id).then(() => {
                    this.showBookmarkPush(product);
                });
            } else {
                this.removeBookmark(product.id).then(() => {
                    PushNotificationsService.success(`${product.name} is verwijderd uit het verlanglijstje!`);
                });
            }

            return product;
        }

        this.showBookmarkPush = function(product) {
            const media = product.photo || product.logo || null;
            const productImgSrc = media?.sizes?.small || media?.sizes?.thumbnail || './assets/img/placeholders/product-small.png';

            this.list({ bookmarked: 1, per_page: 1 }).then((res) => {
                PushNotificationsService.raw({
                    isBookmark: true,
                    icon: null,
                    title: product.name,
                    imageSrc: productImgSrc,
                    message: `Er staan ${res.data.meta.total} aanbiedingen in het verlanglijstje`,
                    group: 'bookmarks',
                    btnText: 'Ga naar mijn verlanglijstje',
                    btnSref: 'bookmarked-products',
                    btnIcon: 'cards-heart-outline',
                });
            });
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
                const { reservations_enabled, reservation_extra_payments_enabled } = fund;

                const applicableVouchers = regularActiveVouchers.filter(voucher => voucher.fund.id == fund.id);
                const reservableVouchers = applicableVouchers.filter(voucher => voucher.query_product && voucher.query_product.reservable);

                const isReservable = reservableVouchers.length > 0;
                const isReservationAvailable = isReservable && productAvailable && reservations_enabled;
                const isReservationExtraPaymentAvailable = isReservationAvailable && reservation_extra_payments_enabled;

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
                    ...{ meta: {
                            shownExpireDate, applicableVouchers, reservableVouchers, isReservationAvailable,
                            isReservationExtraPaymentAvailable
                        } },
                };
            })

            const hasReservableFunds = funds.filter(fund => fund.meta.isReservationAvailable).length > 0;

            return { regularActiveVouchers, funds, hasReservableFunds };
        }

        this.getSortOptions = () => {
            return [{
                label: 'Nieuwe eerst',
                value: {
                    order_by: 'created_at',
                    order_by_dir: 'desc',
                }
            }, {
                label: 'Oudste eerst',
                value: {
                    order_by: 'created_at',
                    order_by_dir: 'asc',
                }
            }, {
                label: 'Prijs (oplopend)',
                value: {
                    order_by: 'price',
                    order_by_dir: 'asc',
                }
            }, {
                label: 'Prijs (aflopend)',
                value: {
                    order_by: 'price',
                    order_by_dir: 'desc',
                }
            }, {
                label: 'Meest gewild',
                value: {
                    order_by: 'most_popular',
                    order_by_dir: 'desc',
                }
            }, {
                label: 'Naam (oplopend)',
                value: {
                    order_by: 'name',
                    order_by_dir: 'asc',
                }
            }, {
                label: 'Naam (aflopend)',
                value: {
                    order_by: 'name',
                    order_by_dir: 'desc',
                }
            }];
        }

        this.transformProductAlternativeText = (product) => {
            const default_text = 'Dit is een afbeelding van het aanbod ' + product.name + ' van aanbieder ' + product.organization.name;
            const provider_text = '.De aanbieder omschrijft het aanbod als volgt: ' + product.alternative_text;

            return default_text + (product.alternative_text ? provider_text : '');
        }
    });
};

module.exports = [
    'ApiRequest',
    'PushNotificationsService',
    ProductService
];
