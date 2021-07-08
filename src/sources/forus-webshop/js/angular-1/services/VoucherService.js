const VoucherService = function(ApiRequest) {
    const apiPrefix = '/platform/vouchers';

    return new (function() {
        this.list = function(query = {}) {
            return ApiRequest.get(apiPrefix, query);
        };

        this.get = function(address) {
            return ApiRequest.get(apiPrefix + '/' + address);
        }

        this.getAsProvider = function(address) {
            return ApiRequest.get(apiPrefix + '/' + address + '/provider');
        }

        this.sendToEmail = function(address) {
            return ApiRequest.post(apiPrefix + '/' + address + '/send-email');
        }

        this.shareVoucher = function(address, values) {
            return ApiRequest.post(apiPrefix + '/' + address + '/share', values);
        }

        this.makeTransaction = function(address, values) {
            return ApiRequest.post(apiPrefix + '/' + address + '/transactions', values);
        }

        this.destroy = function(address) {
            return ApiRequest.delete(
                apiPrefix + '/' + address
            );
        }

        this.composeTransactions = function(voucher) {
            const transactions = voucher.transactions.slice().map(
                transaction => ({ ...transaction, ...{ type: 'transaction' } })
            );

            const productVouchers = (voucher.product_vouchers || []).map(
                product_voucher => ({ ...product_voucher, ...{ type: 'product_voucher' } })
            );

            return [...transactions, ...productVouchers].sort((a, b) => b.timestamp - a.timestamp);
        };

        this.composeCardData = function(voucher) {
            let thumbnail, title, subtitle, description;

            if (voucher.type == 'regular') {
                title = voucher.fund.name;
                subtitle = voucher.fund.organization.name;
                description = voucher.fund.description;

                if (voucher.fund.logo) {
                    thumbnail = voucher.fund.logo.sizes.thumbnail;
                } else if (voucher.fund.organization.logo) {
                    thumbnail = voucher.fund.organization.logo.sizes.thumbnail;
                } else {
                    thumbnail = "./assets/img/placeholders/product-thumbnail.png";
                }
            } else if (voucher.type == 'product') {
                title = voucher.product.name;
                subtitle = voucher.product.organization.name;
                description = voucher.product.description_html;

                if (voucher.product.photo) {
                    thumbnail = voucher.product.photo.sizes.thumbnail;
                } else {
                    thumbnail = "./assets/img/placeholders/product-thumbnail.png";
                }
            }

            return {
                title: title,
                subtitle: subtitle,
                description: description,
                amount: voucher.amount,
                type: voucher.type,
                returnable: voucher.returnable,
                used: voucher.used,
                last_transaction_at_locale: voucher.last_transaction_at_locale,
                transactions: voucher.transactions ? this.composeTransactions(voucher) : [],
                created_at_locale: voucher.created_at_locale,
                expire_at_locale: voucher.expire_at_locale,
                last_active_day_locale: voucher.last_active_day_locale,
                expire_at: voucher.expire_at,
                last_active_day: voucher.last_active_day,
                thumbnail: thumbnail,
                product: voucher.product || null,
                fund: voucher.fund,
                offices: voucher.offices || []
            };
        }
    });
};

module.exports = [
    'ApiRequest',
    VoucherService
];