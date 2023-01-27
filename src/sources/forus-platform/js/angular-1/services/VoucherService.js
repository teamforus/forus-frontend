const VoucherService = function(ApiRequest) {
    return new (function() {
        this.index = (organization_id, query) => {
            return ApiRequest.get([
                '/platform/organizations/' + organization_id,
                '/sponsor/vouchers'
            ].join(''), query);
        };

        this.readProvider = function(address) {
            return ApiRequest.get('/platform/provider/vouchers/' + address);
        };

        this.readProviderProducts = function(address, query = {}) {
            return ApiRequest.get('/platform/provider/vouchers/' + address + '/products', query);
        };

        this.store = (organization_id, data) => {
            return ApiRequest.post([
                '/platform/organizations/' + organization_id,
                '/sponsor/vouchers'
            ].join(''), data);
        };

        this.storeValidate = (organization_id, data) => {
            return ApiRequest.post([
                '/platform/organizations/' + organization_id,
                '/sponsor/vouchers/validate'
            ].join(''), data);
        };

        this.storeCollection = function(organization_id, fund_id, vouchers) {
            return ApiRequest.post(`/platform/organizations/${organization_id}/sponsor/vouchers/batch`, {
                fund_id: fund_id,
                vouchers: vouchers
            });
        };

        this.storeCollectionValidate = function(organization_id, fund_id, vouchers) {
            return ApiRequest.post(`/platform/organizations/${organization_id}/sponsor/vouchers/batch/validate`, {
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

        this.update = (organization_id, voucher_id, query) => {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}`, query);
        };

        this.sendToEmail = (organization_id, voucher_id, email) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/send`, { email });
        };

        this.assign = (organization_id, voucher_id, data) => {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/assign`, data);
        };

        this.activate = (organization_id, voucher_id, data) => {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/activate`, data);
        };

        this.deactivate = (organization_id, voucher_id, data = {}) => {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/deactivate`, data);
        };

        this.makeActivationCode = (organization_id, voucher_id, data = {}) => {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/activation-code`, data);
        };

        this.export = function(organization_id, filters = {}) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/sponsor/vouchers/export`, filters);
        };

        this.exportFields = function(organization_id, filters = {}) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/sponsor/vouchers/export-fields`, filters);
        };

        this.makeSponsorTransaction = (organization_id, data = {}) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/sponsor/transactions`, data);
        };

        this.sampleCSVBudgetVoucher = (expires_at = "2020-02-20") => {
            const headers = ['amount', 'expires_at', 'note', 'email', 'activate', 'activation_code', 'client_uid'];
            const values = [10, expires_at, 'voorbeeld notitie', 'test@example.com', 0, 0, ''];

            return Papa.unparse([headers, values]);
        };

        this.sampleCSVSubsidiesVoucher = (expires_at = "2020-02-20") => {
            const headers = ['expires_at', 'note', 'email', 'activate', 'activation_code', 'client_uid'];
            const values = [expires_at, 'voorbeeld notitie', 'test@example.com', 0, 0, ''];

            return Papa.unparse([headers, values]);
        };

        this.sampleCSVProductVoucher = (product_id = null, expires_at = "2020-02-20") => {
            const headers = ['product_id', 'expires_at', 'note', 'email', 'activate', 'activation_code', 'client_uid'];
            const values = [product_id, expires_at, 'voorbeeld notitie', 'test@example.com', 0, 0, ''];

            return Papa.unparse([headers, values]);
        };

        this.getStates = () => {
            return [{
                value: null,
                name: 'Alle'
            }, {
                value: 'pending',
                name: 'Inactief'
            }, {
                value: 'active',
                name: 'Actief'
            }, {
                value: 'deactivated',
                name: 'Gedeactiveerd'
            }, {
                value: 'expired',
                name: 'Verlopen'
            }];
        };

        this.apiResourceToForm = function (apiResource) {
            let expire_at_year = moment(apiResource.expire_at).year();

            apiResource.expire_at_day_month = apiResource.expire_at_locale.replace(expire_at_year, '').trim();
            apiResource.expire_at_year = expire_at_year;

            if (apiResource.first_use_date) {
                let first_use_year = moment(apiResource.first_use_date).year();
                
                apiResource.first_use_day_month = apiResource.first_use_date_locale.replace(first_use_year, '').trim();
                apiResource.first_use_year = first_use_year;
            }

            return apiResource;
        };
    });
};

module.exports = [
    'ApiRequest',
    VoucherService
];
