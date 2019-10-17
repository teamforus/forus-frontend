module.exports = [
    'ApiRequest',
    function(
        ApiRequest
    ) {
        return new(function() {
            this.index = (organization_id, query) => {
                return ApiRequest.get([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers'
                ].join(''), query);
            };

            this.store = (organization_id, data) => {
                return ApiRequest.post([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers'
                ].join(''), data);
            };
            
            this.storeCollection = function(organization_id, fund_id, vouchers) {
                return ApiRequest.post([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers'
                ].join(''), {
                    fund_id: fund_id,
                    vouchers: vouchers
                });
            };

            this.show = (organization_id, voucher_id) => {
                return ApiRequest.get([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers/' + voucher_id
                ].join(''));
            };

            this.assign = (organization_id, voucher_id, email) => {
                return ApiRequest.patch([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers/' + voucher_id + '/assign',
                ].join(''), {
                    email: email
                });
            };

            this.sendToEmail = (organization_id, voucher_id, email) => {
                return ApiRequest.post([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers/' + voucher_id + '/send',
                ].join(''), {
                    email: email
                });
            };

            this.exportUnassignedQRCodes = (organization_id) => {
                return ApiRequest.post([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers/export-unassigned',
                ].join(''));
            };
        });
    }
];