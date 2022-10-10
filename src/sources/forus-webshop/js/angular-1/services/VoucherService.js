const VoucherService = function(ApiRequest) {
    const apiPrefix = '/platform/vouchers';

    return new (function() {
        /**
         * Send all voucher
         * 
         * @param {string} address 
         * @param {object} query 
         * @returns 
         */
        this.list = function(query = {}) {
            return ApiRequest.get(`${apiPrefix}`, query);
        };

        /**
         * Get voucher
         * 
         * @param {string} address
         * @returns 
         */
        this.get = function(address) {
            return ApiRequest.get(`${apiPrefix}/${address}`);
        }

        /**
         * Send voucher to own email
         * 
         * @param {string} address 
         * @returns 
         */

        this.sendToEmail = function(address) {
            return ApiRequest.post(`${apiPrefix}/${address}/send-email`);
        }

        /**
         * Send voucher to the provider
         * 
         * @param {string} address 
         * @param {object} values 
         * @returns 
         */
        this.shareVoucher = function(address, values = {}) {
            return ApiRequest.post(`${apiPrefix}/${address}/share`, values);
        }

        /**
         * Delete voucher (cancel reservation)
         * 
         * @param {string} address 
         * @returns 
         */
        this.destroy = function(address) {
            return ApiRequest.delete(`${apiPrefix}/${address}`);
        }

        /**
         * Deactivate own voucher
         * 
         * @param {string} address 
         * @param {object} data 
         * @returns 
         */
        this.deactivate = function(address, data = {}) {
            return ApiRequest.post(`${apiPrefix}/${address}/deactivate`, data);
        }

        this.composeTransactions = function (voucher) {
            const transactions = voucher.transactions.slice().map((transaction) => ({
                ...transaction, type: 'transaction', incoming: transaction.target === 'top_up',
            }));

            const productVouchers = (voucher.product_vouchers || []).map((product_voucher) => ({
                ...product_voucher, type: 'product_voucher', incoming: false,
            }));

            return [...transactions, ...productVouchers].sort((a, b) => b.timestamp - a.timestamp);
        };

        this.getVoucherThumbnail = function(voucher) {
            if (voucher.type == 'regular') {
                if (voucher.fund.logo) {
                    return voucher.fund.logo.sizes.thumbnail;
                } else if (voucher.fund.organization.logo) {
                    return voucher.fund.organization.logo.sizes.thumbnail;
                }
            }

            if (voucher.type == 'product' && voucher.product.photo) {
                return voucher.product.photo.sizes.thumbnail;
            }

            return "./assets/img/placeholders/product-thumbnail.png";
        };

        this.composeCardData = function(voucher) {
            const { transactions, product, fund } = voucher;

            return {
                ...voucher,
                thumbnail: this.getVoucherThumbnail(voucher),
                title: product ? product.name : fund.name,
                subtitle: product ? product.organization.name : fund.organization.name,
                description: product ? product.description_html : fund.description,
                transactions: transactions ? this.composeTransactions(voucher) : [],
                product: voucher.product || null,
                offices: voucher.offices || [],
            };
        }
    });
};

module.exports = [
    'ApiRequest',
    VoucherService
];