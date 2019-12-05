let VoucherService = function(
    ApiRequest
) {
    let apiPrefix = '/platform/vouchers';

    let addType = (type, transaction) => {
        transaction.type = type;

        return transaction;
    };

    return new(function() {
        this.list = function() {
            return ApiRequest.get(apiPrefix);
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

        this.makeProductVoucher = function(voucherAddress, productId) {
            return ApiRequest.post(apiPrefix, {
                voucher_address: voucherAddress,
                product_id: productId
            });
        };

        this.composeTransactions = function(voucher) {
            return voucher.transactions.slice().map(
                transaction => addType('transaction', transaction)
            ).concat((voucher.product_vouchers || []).map(
                product_voucher => addType('product_voucher', product_voucher)
            )).sort((a, b) => b.timestamp - a.timestamp);
        }

        this.composeCardData = function(voucher) {
            let thumbnail, title, subtitle;

            if (voucher.type == 'regular') {
                title = voucher.fund.name;
                subtitle = voucher.fund.organization.name;

                if (voucher.fund.logo) {
                    thumbnail = voucher.fund.logo.sizes.thumbnail;
                } else if (voucher.fund.organization.logo) {
                    thumbnail = voucher.fund.organization.logo.sizes.thumbnail;
                } else {
                    thumbnail = "./assets/img/placeholders/product-thumbnail.png";
                }
            } else if (voucher.type == 'product') {
                title = voucher.product.name;
                subtitle = null;

                if (voucher.product.photo) {
                    thumbnail = voucher.product.photo.sizes.thumbnail;
                } else {
                    thumbnail = "./assets/img/placeholders/product-thumbnail.png";
                }
            }


            return {
                title: title,
                subtitle: subtitle,
                amount: voucher.amount,
                type: voucher.type,
                returnable: voucher.returnable,
                transactions: this.composeTransactions(voucher),
                created_at_locale: voucher.created_at_locale,
                expire_at_locale: voucher.expire_at_locale,
                expire_at: voucher.expire_at,
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