const VoucherService = function($filter, ApiRequest) {
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

        this.getColumns = () => {
            const $translate = (key) => $filter('translate')(`vouchers.${key}`);

            return [{
                key: 'id',
                label: $translate('labels.id'),
                tooltip: {
                    key: 'id',
                    title: 'ID / NR',
                    description: $translate('tooltips.id'),
                },
            }, {
                key: 'assigned_to',
                label: $translate('labels.assigned_to'),
                tooltip: {
                    key: 'assigned_to',
                    title: 'Methode',
                    description: $translate('tooltips.assigned_to'),
                },
            }, {
                key: 'source',
                label: $translate('labels.source'),
                tooltip: {
                    key: 'source',
                    title: 'Aangemaakt door',
                    description: $translate('tooltips.source'),
                },
            }, {
                key: 'amount',
                label: $translate('labels.amount'),
                fundType: 'budget',
                tooltip: {
                    key: 'amount',
                    title: 'Bedrag',
                    description: $translate('tooltips.amount'),
                },
            }, {
                key: 'note',
                label: $translate('labels.note'),
                tooltip: {
                    key: 'note',
                    title: 'Notitie',
                    description: $translate('tooltips.note'),
                },
            }, {
                key: 'fund',
                label: $translate('labels.fund'),
                tooltip: {
                    key: 'fund',
                    title: 'Fonds',
                    description: $translate('tooltips.fund'),
                },
            }, {
                key: 'created_at',
                label: $translate('labels.created_at'),
                tooltip: {
                    key: 'created_at',
                    title: 'Aangemaakt op',
                    description: $translate('tooltips.created_at'),
                },
            }, {
                key: 'expire_at',
                label: $translate('labels.expire_at'),
                tooltip: {
                    key: 'expire_at',
                    title: 'Geldig tot en met',
                    description: $translate('tooltips.expire_at'),
                },
            }, {
                key: 'in_use',
                label: $translate('labels.in_use'),
                tooltip: {
                    key: 'in_use',
                    title: 'In gebruik',
                    description: $translate('tooltips.in_use'),
                },
            }, {
                key: 'state',
                label: $translate('labels.state'),
                tooltip: {
                    key: 'state',
                    title: 'Status',
                    description: $translate('tooltips.state'),
                },
            }];
        };
    });
};

module.exports = [
    '$filter',
    'ApiRequest',
    VoucherService,
];
